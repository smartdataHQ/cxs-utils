from setuptools import setup, find_packages

setup(
    name="cxs-utils",
    version="0.1.0",
    description="Context Suite Utilities for Data Engineering",
    author="BinaryNavigator07",
    packages=find_packages(),
    install_requires=[
        "requests>=2.32.4",
        "pydantic>=2.11.7",
        "aiohttp>=3.12.13",
        "aioresponses>=0.7.6",  # Assuming 0.7.6 is latest, PyPI was down
        "fastavro>=1.9.4",  # Assuming 1.9.4 is latest, PyPI was down
        "deepdiff>=7.0.1",  # Assuming 7.0.1 is latest, PyPI was down
        "jsonschema>=4.24.0",
    ],
    python_requires=">=3.8",
)
