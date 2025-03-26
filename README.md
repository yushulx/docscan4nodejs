# Document Scanner SDK for Node.js
The package provides Node.js APIs for invoking **Dynamic Web TWAIN Service REST API**. It helps developers to create **desktop** or **server-side** document scanning applications with ease. 

## Key Features
- 🖨️ ​Multi-driver Support
    - TWAIN (32-bit & 64-bit)
    - WIA (Windows Image Acquisition)
    - SANE (Scanner Access Now Easy)
    - ICA (Image Capture Architecture)
    - eSCL (AirScan/Mopria)
- 🌐 ​Cross-platform Compatibility
    - Windows 7+
    - Linux (x64/ARM64/MIPS64)
    - macOS 10.15+

## Prerequisites
-  Install Dynamic Web TWAIN Service.
    - Windows: [Dynamsoft-Service-Setup.msi](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup.msi)
    - macOS: [Dynamsoft-Service-Setup.pkg](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup.pkg)
    - Linux: 
        - [Dynamsoft-Service-Setup.deb](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup.deb)
        - [Dynamsoft-Service-Setup-arm64.deb](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup-arm64.deb)
        - [Dynamsoft-Service-Setup-mips64el.deb](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup-mips64el.deb)
        - [Dynamsoft-Service-Setup.rpm](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup.rpm)

- Request a [free trial license](https://www.dynamsoft.com/customer/license/trialLicense?product=dwt) for Dynamic Web TWAIN Service.

## Dynamic Web TWAIN Service Configuration
After installing the Dynamic Web TWAIN Service, navigate to `http://127.0.0.1:18625/` in a web browser to configure the host and port settings. The default host IP address is set to `127.0.0.1`. If you wish to make the service accessible over the local network in your office or company, you can update the host setting to a LAN IP address, such as **192.168.8.72**.

![dynamsoft-service-config](https://github.com/yushulx/dynamsoft-service-REST-API/assets/2202306/e2b1292e-dfbd-4821-bf41-70e2847dd51e)

## REST API Reference
By default, the REST API's host address is set to `http://127.0.0.1:18622`.

| Method | Endpoint        | Description                   | Parameters                         | Response                      |
|--------|-----------------|-------------------------------|------------------------------------|-------------------------------|
| GET    | `/DWTAPI/Scanners`    | Get a list of scanners  | None                               | `200 OK` with scanner list       |
| POST   | `/DWTAPI/ScanJobs`    | Creates a scan job      | `license`, `device`, `config`      | `201 Created` with job ID    |
| GET    | `/DWTAPI/ScanJobs/:id/NextDocument`| Retrieves a document image     | `id`: Job ID   | `200 OK` with image stream    |
| DELETE | `/DWTAPI/ScanJobs/:id`| Deletes a scan job       | `id`: Job ID                      | `200 OK`              |

## Node.js API
- `getDevices(host, scannerType)` - Get all available scanners. It returns an array of scanner objects.
- `createJob(host, parameters)` - Create a scanner job by feeding one or multiple physical documents. It returns the job id.
- `getImageFile(host, jobId, directory)` - Get one document image by job id. The directory specifies the physical location to save the images. It returns the image path.
- `getImageFiles(host, jobId, directory)` - Get document images by job id. The directory specifies the physical location to save the images. It returns an array of image paths.
- `deleteJob(host, jobId)` - Delete a scan job by job id. It can interrupt the scan process.
- `getImageStreams(host, jobId)` - Get document images by job id. It returns an array of image streams.

## Parameter Configuration
The parameter configuration is based on [Dynamsoft Web TWAIN documentation](https://www.dynamsoft.com/web-twain/docs/info/api/Interfaces.html#DeviceConfiguration). It controls the behavior of the scanner. 

For example, you can set the resolution to 200 DPI and the pixel type to color:

```js
let parameters = {
    license: "LICENSE-KEY",
    device: devices[index].device,
};

parameters.config = {
    IfShowUI: false,
    PixelType: 2, // color
    Resolution: 200,
    IfFeederEnabled: false,
    IfDuplexEnabled: false,
};
```

## Examples
Set the `LICENSE-KEY` before running the following examples.

- [Command-line](https://github.com/yushulx/dynamsoft-service-REST-API/tree/main/examples/command-line)

  Get all available scanners

  ![image](https://github.com/yushulx/dynamsoft-service-REST-API/assets/2202306/24fcb45d-1bea-45ba-9569-b9a2ef377b63)

  Acquire a Document
    
  ![image](https://github.com/yushulx/dynamsoft-service-REST-API/assets/2202306/2688269d-4f05-4734-bf1c-7ba4e2638d66)

- [Web server](https://github.com/yushulx/dynamsoft-service-REST-API/tree/main/examples/web)

   ![server-side-document-scan](https://github.com/yushulx/dynamsoft-service-REST-API/assets/2202306/9a161dda-6f9d-473b-a2d4-168ebd5f6b0b)


