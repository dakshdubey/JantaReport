import sys
print("Python version:", sys.version)

try:
    import fastapi
    print("✓ FastAPI installed")
except ImportError as e:
    print("✗ FastAPI missing:", e)

try:
    import uvicorn
    print("✓ Uvicorn installed")
except ImportError as e:
    print("✗ Uvicorn missing:", e)

try:
    import sklearn
    print("✓ Scikit-learn installed")
except ImportError as e:
    print("✗ Scikit-learn missing:", e)

print("\nAll checks complete!")
