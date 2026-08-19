"""
scripts/download_datasets.py
Downloads Indian legal datasets from HuggingFace into data/raw/

Run from inside ai-service/:
    .\\venv\\Scripts\\python.exe scripts\\download_datasets.py
"""

import os
import sys
import json
import warnings
from pathlib import Path
from dotenv import load_dotenv

# ── Suppress noisy warnings ────────────────────────────────────
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
warnings.filterwarnings("ignore")

# ── Load environment ───────────────────────────────────────────
load_dotenv()
HF_TOKEN = os.getenv("HUGGINGFACEHUB_ACCESS_TOKEN")
if not HF_TOKEN:
    print("ERROR: HUGGINGFACEHUB_ACCESS_TOKEN not found in .env")
    sys.exit(1)

# ── Setup paths ────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
RAW_DIR  = BASE_DIR / "data" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

# ── Dataset definitions ────────────────────────────────────────
DATASETS = [
    {
        "id"      : "nandhakumarg/IPC_and_BNS_transformation",
        "name"    : "ipc_bns_mapping",
        "desc"    : "Old IPC to New BNS cross-reference (563 sections)",
    },
    {
        "id"      : "navaneeth005/BNS_definitions",
        "name"    : "bns_definitions",
        "desc"    : "All 358 BNS section definitions formatted for RAG",
    },
    {
        "id"      : "GSMS-B/Indian-Legal-QA-BNS-BNSS-BSA",
        "name"    : "indian_legal_qa",
        "desc"    : "Q&A pairs across BNS/BNSS/BSA sections",
        "use_http": True,     # download raw Parquet directly — bypasses schema bug
    },
    {
        "id"      : "infinite-dataset-hub/IndianLaw",
        "name"    : "indian_law_general",
        "desc"    : "General Indian law Q&A dataset",
    },
]


def already_downloaded(save_dir: Path) -> int:
    """Return row count if already downloaded, else 0."""
    files = list(save_dir.glob("*.jsonl")) if save_dir.exists() else []
    if not files:
        return 0
    count = 0
    for f in files:
        with open(f, encoding="utf-8") as fh:
            count += sum(1 for _ in fh)
    return count


def save_rows(rows: list, save_dir: Path, split: str = "train") -> int:
    """Save a list of dicts to JSONL."""
    out = save_dir / f"{split}.jsonl"
    with open(out, "w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
    return len(rows)


def download_via_http_parquet(hf_id: str, save_dir: Path) -> bool:
    """
    Download raw Parquet files directly via HTTP — bypasses HuggingFace
    datasets library schema validation bugs entirely.
    """
    import requests
    import io

    print(f"  Trying direct Parquet download...")

    # HuggingFace Parquet API endpoint
    api_url = f"https://huggingface.co/api/datasets/{hf_id}/parquet"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}

    try:
        resp = requests.get(api_url, headers=headers, timeout=30)
        resp.raise_for_status()
        parquet_info = resp.json()
    except Exception as e:
        print(f"  Could not get Parquet info: {e}")
        return False

    # Collect all file URLs from all splits
    all_rows = []
    for split_name, configs in parquet_info.items():
        if isinstance(configs, list):
            files = configs
        elif isinstance(configs, dict):
            files = []
            for cfg_files in configs.values():
                files.extend(cfg_files)
        else:
            continue

        for file_info in files:
            url = file_info.get("url") if isinstance(file_info, dict) else file_info
            if not url:
                continue
            try:
                # pyrefly: ignore [missing-import]
                import pyarrow.parquet as pq
                r = requests.get(url, headers=headers, timeout=60)
                r.raise_for_status()
                table = pq.read_table(io.BytesIO(r.content))
                rows = table.to_pydict()
                keys = list(rows.keys())
                n = len(rows[keys[0]])
                for i in range(n):
                    all_rows.append({k: rows[k][i] for k in keys})
                print(f"  Got {n} rows from {url.split('/')[-1]}")
            except Exception as e:
                print(f"  Skipped file: {e}")

    if all_rows:
        saved = save_rows(all_rows, save_dir)
        print(f"  DONE (HTTP Parquet) - {saved:,} rows saved")
        return True
    return False


def download_dataset(dataset_info: dict) -> bool:
    """Download one dataset — tries multiple methods."""
    # pyrefly: ignore [missing-import]
    from datasets import load_dataset

    hf_id    = dataset_info["id"]
    name     = dataset_info["name"]
    desc     = dataset_info["desc"]
    use_http = dataset_info.get("use_http", False)

    save_dir = RAW_DIR / name
    save_dir.mkdir(exist_ok=True)

    # Skip if already downloaded
    existing = already_downloaded(save_dir)
    if existing:
        print(f"  [SKIP] {name} - already downloaded ({existing:,} rows)")
        return True

    print(f"\n[DOWNLOAD] {hf_id}")
    print(f"  {desc}")

    # Method 1: Direct HTTP Parquet (for datasets with schema bugs)
    if use_http:
        if download_via_http_parquet(hf_id, save_dir):
            return True
        print("  HTTP Parquet failed, trying datasets library...")

    # Method 2: Standard datasets library
    try:
        dataset = load_dataset(hf_id, token=HF_TOKEN)
        all_rows = []
        for split_name, split_data in dataset.items():
            rows = [dict(row) for row in split_data]
            saved = save_rows(rows, save_dir, split_name)
            print(f"  Saved '{split_name}' - {saved:,} rows -> {split_name}.jsonl")
            all_rows.extend(rows)
        print(f"  DONE - {len(all_rows):,} total rows")
        return True
    except Exception as e1:
        print(f"  Standard load failed: {e1}")

    # Method 3: Streaming fallback
    print(f"  Retrying with streaming...")
    try:
        ds = load_dataset(hf_id, token=HF_TOKEN, streaming=True)
        rows = []
        for i, row in enumerate(ds["train"]):
            rows.append(dict(row))
            if (i + 1) % 1000 == 0:
                print(f"    Streamed {i+1} rows...", end="\r")
        if rows:
            saved = save_rows(rows, save_dir)
            print(f"  DONE (streaming) - {saved:,} rows saved")
            return True
    except Exception as e2:
        print(f"  Streaming failed: {e2}")

    return False


def main():
    print("=" * 60)
    print("  NYAYA - Indian Legal Dataset Downloader")
    print("=" * 60)
    print(f"  HF Token : **********{HF_TOKEN[-6:]}")
    print(f"  Save dir : {RAW_DIR}")
    print(f"  Datasets : {len(DATASETS)}")
    print("=" * 60)

    results = {}
    for ds in DATASETS:
        ok = download_dataset(ds)
        results[ds["name"]] = "OK" if ok else "FAILED"

    print("\n" + "=" * 60)
    print("  SUMMARY")
    print("=" * 60)
    for name, status in results.items():
        tag = "[OK]    " if status == "OK" else "[FAILED]"
        print(f"  {tag} {name}")

    ok_count = sum(1 for v in results.values() if v == "OK")
    print(f"\n  {ok_count}/{len(results)} datasets ready")

    if ok_count >= 2:
        print("\nYou have enough data to proceed!")
        print("Next: .\\venv\\Scripts\\python.exe scripts\\ingest_legal_data.py")


if __name__ == "__main__":
    main()
