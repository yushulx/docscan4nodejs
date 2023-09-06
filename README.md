# Dynamsoft Service REST API Sample
This repository demonstrates how to use the **Dynamsoft Service REST API** to retrieve information from Multi-function printers (MFPs) and to scan documents using these MFPs.

## Prerequisites
- [Node.js](https://nodejs.org/en/download)
- [Dynamsoft Service for Windows](https://www.dynamsoft.com/codepool/downloads/DynamsoftServiceSetup.msi)
    
    Currently, the REST API is only available on **Windows**. It will come to **Linux (x64, ARM64)** and **macOS** soon.
- **License for Dynamsoft Service**

    You can get a trial license from [here](https://www.dynamsoft.com/customer/license/trialLicense?product=dwt).

## Getting Started
1. Install dependencies:

    ```bash
    npm install
    ```

2. Set the license key in `app.js`:

    ```js
    let scanParams = {
        license: "LICENSE-KEY",
    };
    ```
3. Run the app:

    ```bash
    node app.js
    ```