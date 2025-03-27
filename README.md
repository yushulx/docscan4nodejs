# Document Scanner SDK for Node.js

The package provides Node.js APIs for invoking the **Dynamic Web TWAIN Service REST API**. It helps developers create **desktop** or **server-side** document scanning and processing applications with ease.

---

## 🚀 Key Features

- 🖨️ **Multi-Driver Support**
  - TWAIN (32-bit & 64-bit)
  - WIA (Windows Image Acquisition)
  - SANE (Scanner Access Now Easy)
  - ICA (Image Capture Architecture)
  - eSCL (AirScan/Mopria)
  - Wi-Fi Direct

- 🌐 **Cross-Platform Compatibility**
  - Windows 7+
  - macOS 10.15+
  - Linux (x64 / ARM64 / MIPS64)

---

## ⚙️ Prerequisites

### ✅ Install Dynamic Web TWAIN Service:

- **Windows**: [Dynamsoft-Service-Setup.msi](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup.msi)
- **macOS**: [Dynamsoft-Service-Setup.pkg](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup.pkg)
- **Linux**:
  - [Dynamsoft-Service-Setup.deb](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup.deb)
  - [Dynamsoft-Service-Setup-arm64.deb](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup-arm64.deb)
  - [Dynamsoft-Service-Setup-mips64el.deb](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup-mips64el.deb)
  - [Dynamsoft-Service-Setup.rpm](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup.rpm)

### 🔑 Get a License

Request a [free trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) for the Dynamic Web TWAIN Service.

---

## 🧩 Configuration

After installation, open `http://127.0.0.1:18625/` in your browser to configure the **host** and **port** settings.

> By default, the service is bound to `127.0.0.1`. To access it across the LAN, change the host to your local IP (e.g., `192.168.8.72`).

![dynamsoft-service-config](https://github.com/yushulx/dynamsoft-service-REST-API/assets/2202306/e2b1292e-dfbd-4821-bf41-70e2847dd51e)

---

## 📡 REST API Endpoints

[https://www.dynamsoft.com/web-twain/docs/info/api/restful.html](https://www.dynamsoft.com/web-twain/docs/info/api/restful.html)

## 📦 Node.js APIs

### 🔍 Scanner APIs

- `getDevices(host, scannerType)`  
  Get available scanners. Returns an array of devices.

- `createJob(host, parameters)`  
  Create a new scan job. Returns a job object.

- `checkJob(host, jobId)`  
  Check job status (e.g., running, canceled, etc.)

- `deleteJob(host, jobId)`  
  Delete a scan job and terminate scanning.

- `updateJob(host, jobId, parameters)`  
  Update job status (e.g., cancel a running job).

- `getScannerCapabilities(host, jobId)`  
  Get scanner capabilities like resolution, color modes.

### 🖼️ Image Retrieval

- `getImageFile(host, jobId, directory)`  
  Fetch one image and save to local disk.

- `getImageFiles(host, jobId, directory)`  
  Fetch all images for a job and save to local disk.

- `getImageStream(host, jobId)`  
  Fetch one image as a readable stream.

- `getImageStreams(host, jobId)`  
  Fetch all images as streams.

- `getImageInfo(host, jobId)`  
  Retrieve metadata of the next page.

### 📄 Document APIs

- `createDocument(host, parameters)`  
  Create a new empty document (PDF).

- `getDocumentInfo(host, docId)`  
  Get document metadata and structure.

- `deleteDocument(host, docId)`  
  Delete an existing document.

- `getDocumentFile(host, docId, directory)`  
  Download the document and save as a PDF.

- `getDocumentStream(host, docId)`  
  Download document as a stream.

- `insertPage(host, docId, parameters)`  
  Insert a new page into an existing document.

- `deletePage(host, docId, pageId)`  
  Remove a page from an existing document.

---

## ⚙️ Scan Job Parameters

The configuration follows [Dynamsoft Web TWAIN DeviceConfiguration](https://www.dynamsoft.com/web-twain/docs/info/api/Interfaces.html#DeviceConfiguration).

```js
let parameters = {
  license: "LICENSE-KEY",
  device: devices[0].device,
  config: {
    IfShowUI: false,
    PixelType: 2, // Color
    Resolution: 200,
    IfFeederEnabled: false,
    IfDuplexEnabled: false
  }
};
```

---

## 🧪 Examples

Set the `LICENSE-KEY` before running the examples.

### 🖥️ Command-line App

- [Command-line Example](https://github.com/yushulx/dynamsoft-service-REST-API/tree/main/examples/command-line)

  - Discover devices  
    ![image](https://github.com/yushulx/dynamsoft-service-REST-API/assets/2202306/24fcb45d-1bea-45ba-9569-b9a2ef377b63)

  - Scan and save documents  
    ![image](https://github.com/yushulx/dynamsoft-service-REST-API/assets/2202306/2688269d-4f05-4734-bf1c-7ba4e2638d66)

### 🌐 Web Server App

- [Web Server Example](https://github.com/yushulx/dynamsoft-service-REST-API/tree/main/examples/web)

  ![server-side-document-scan](https://github.com/yushulx/dynamsoft-service-REST-API/assets/2202306/9a161dda-6f9d-473b-a2d4-168ebd5f6b0b)
