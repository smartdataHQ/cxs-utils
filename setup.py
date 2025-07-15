from setuptools import setup, find_packages

setup(
    name="cxs-utils",
    version="0.1.0",
    description="Context Suite Utilities for Data Engineering",
    author="BinaryNavigator07",
    packages=find_packages(),
    install_requires=[
        "requests>=2.28.1",
        "pydantic>=2.10.5",
        "aiohttp>=3.9.1",
        "aioresponses>=0.7.5",
        "fastavro>=1.9.1",
        "deepdiff>=6.3.1",
        "jsonschema>=4.19.1",
        "Unidecode==1.4.0",
        "Jinja2==3.1.6",
        "pandas==2.3.1",
        "python-slugify==8.0.4"
    ],
    python_requires=">=3.8",
)
