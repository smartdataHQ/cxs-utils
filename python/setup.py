from setuptools import setup, find_packages

setup(
    name="cxs",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "requests==2.32.3",
        "pydantic==2.11.5",
        "aiohttp==3.12.11",
        "aioresponses==0.7.8",
    ],
    description="Context Suite Utilities for Data Engineering",
    author="SmartdataHQ",
)
