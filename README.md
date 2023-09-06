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

   - Get all available scanners
   
     ![image](https://github.com/yushulx/dynamsoft-service-REST-API/assets/2202306/24fcb45d-1bea-45ba-9569-b9a2ef377b63)

   - Acquire a Document
     
     ![image](https://github.com/yushulx/dynamsoft-service-REST-API/assets/2202306/2688269d-4f05-4734-bf1c-7ba4e2638d66)


