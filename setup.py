from setuptools import setup, find_packages

setup(
    name="cxs-utils",
    version="0.1.0",
    description="Context Suite Utilities for Data Engineering",
    author="BinaryNavigator07",
    packages=find_packages(),
    install_requires = [
    "requests>=2.32.4",
    "pydantic>=2.11.5",
    "aiohttp>=3.12.12",
    "aioresponses>=0.7.8",
    "unidecode>=1.4.0",
    "jinja2>=3.1.6",
    "pandas>=2.3.0",
    "python-slugify>=8.0.4",
    ],
    python_requires=">=3.8",
)
