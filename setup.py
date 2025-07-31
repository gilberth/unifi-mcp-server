#!/usr/bin/env python3
"""
Setup script for UniFi MCP Server
"""

from setuptools import setup, find_packages
import os

# Read the README file
def read_readme():
    with open("README.md", "r", encoding="utf-8") as fh:
        return fh.read()

# Read requirements
def read_requirements():
    with open("requirements.txt", "r", encoding="utf-8") as fh:
        return [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="unifi-mcp-server",
    version="1.0.0",
    author="Gilberth",
    author_email="your-email@example.com",  # Cambia esto por tu email
    description="Servidor MCP para gestión de redes UniFi con 57 herramientas",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    url="https://github.com/gilberth/unifi-mcp-server",
    packages=find_packages(),
    py_modules=["unifi_mcp_server", "config"],
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: System Administrators",
        "Intended Audience :: Developers",
        "Topic :: System :: Networking",
        "Topic :: System :: Systems Administration",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=read_requirements(),
    entry_points={
        "console_scripts": [
            "unifi-mcp-server=unifi_mcp_server:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.md", "*.txt", "*.json"],
    },
    keywords="unifi, mcp, server, network, management, ubiquiti, claude, ai",
    project_urls={
        "Bug Reports": "https://github.com/gilberth/unifi-mcp-server/issues",
        "Source": "https://github.com/gilberth/unifi-mcp-server",
        "Documentation": "https://github.com/gilberth/unifi-mcp-server#readme",
    },
)