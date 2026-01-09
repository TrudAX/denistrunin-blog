---
title: "Copy data from Dynamics 365 Finance & Operations Azure SQL Database (Tier2) to local SQL Server (AxDB)"
date: "2026-01-01T12:00:00.000Z"
tags: ["D365FO", "Tools", "SQL", "Data Management", "DevOps"]
path: "/d365fo-db-copy"
featuredImage: "./logo.png"
excerpt: "A new utility to synchronize data from D365FO cloud environments to local AxDB, featuring incremental sync and smart strategies."
---

One of the frequent challenges in Dynamics 365 Finance & Operations development is keeping the local development database (`AxDB`) synchronized with fresh data from a Tier2 (UAT/Sandbox) environment. Standard approaches often involve restoring a full BACPAC, which is time-consuming and overwrites everything, or manually copying data, which is tedious and error-prone.

To address this, I created the **D365FO-DB-Copy** utility. This tool helps developers synchronize data from D365FO cloud environments to their local development databases, making it easier to test with production-like data. The main idea is to make the last X records (ordered by `RecId`) the same between Tier2 and `AxDB`.

## Usage

For detailed technical instructions and setup steps, please refer to the [GitHub repository](https://github.com/TrudAX/D365FO-DB-Copy).

The main workflow is straightforward:

1.  **Prepare your environment**: Whitelist your IP and get database credentials from LCS.
2.  **Configure the tool**: Enter the connection details for both the source (Tier2) and destination (Local AxDB).
3.  **Define strategies**: Choose which tables to copy and how (e.g., last 10k records).
4.  **Sync**: Run the discovery and process steps to synchronize the data.

## Custom Copy Strategies

The default behavior of the tool is to copy the last X records (based on `RecId`). While this works for most transaction tables, you might need more control for some tables.

You can define custom copy strategies using the following syntax:

`TableName|RecordCount|sql:CustomQuery -truncate`

also the CustomQuery may contains the following placeholders:

*   `@recordCount`: Replaced with the record count defined in the global parameters.
*   `@sysRowVersionFilter`: Essential for enabling **INCREMENTAL** mode in custom SQL strategies.

### Examples

Let's describe different scenarious where a custom copy strategy is required.

#### Copy tables where a row contains large data

Some tables may contains images or some binary info and copying a standard 100k records may take a lot of time. For such scenario one you can specify custom RecordCount to copy to limit the number of records. Usage examples:

    *   `ECORESPRODUCTIMAGE|1000`: Copies the last 1,000 product images.
    *   `WHSCONTAINERTABLE|50000`: Copies the last 50,000 warehouse containers.

#### Copy Inventory dimensions if Licence plate is used(InventDim)

In case you use a WHS solution, InventDim table may contains a lot of records with a LicensePlateId. During the copy you can't simply take the latest records, as you miss a lot of references to InventDimId that have a blank LicensePlateId. The solutoin for this is to take all dimensions without LicensePlateId PLUS all recent records with LicensePlateId. In this case you transfer the records that may be used in some setup and the latest transactional records. A setting for this looks the following:

    ```text
    InventDim|sql: SELECT * FROM InventDim WHERE RecId IN (SELECT RecId FROM (SELECT RecId FROM InventDim WHERE LICENSEPLATEID = '' AND PARTITION = 5637144576 AND DATAAREAID = 'USMF' AND WMSLOCATIONID = '' UNION SELECT RecId FROM (SELECT TOP 50000 RecId FROM InventDim ORDER BY RecId DESC) t) u) AND @sysRowVersionFilter ORDER BY RecId DESC
    ```

#### Copy inventory onhand (InventSum)

If InventSum is large, you may deside to copy only records that have some values. These records has the foolowing filter (`Closed = 0`), and it can reduce data volume. A settings for this will be the following:

    ```text
    InventSum|sql: SELECT * FROM InventSum WHERE Closed = 0 AND @sysRowVersionFilter ORDER BY RecId DESC
    ```

 #### Copy inventory reservations 

To optimize a copy of inventory reservation (WHSINVENTRESERVE) we can use a filter that includes all reservation for a level 1 PLUS any records modified in the last 93 days. This ensures you have both current availability and recent history.

    ```text
    WHSINVENTRESERVE|sql: SELECT * FROM WHSINVENTRESERVE WHERE ((HIERARCHYLEVEL = 1 AND AVAILPHYSICAL <> 0) OR MODIFIEDDATETIME > DATEADD(DAY, -93, GETUTCDATE())) AND PARTITION = 5637144576 AND DATAAREAID = 'USMF' AND @sysRowVersionFilter ORDER BY RecId DESC
    ```

## Key Features

### SysRowVersion Optimization (Incremental Sync)
This is a game-changer for frequent updates. For tables with `SysRowVersion`:
- **First Run**: Performs a standard delta comparison.
- **Subsequent Runs**: Calculates the change percentage.
    - If changes < 40%, it runs in **INCREMENTAL Mode** (deletes only changed/new records and re-inserts them).
    - If changes > 40%, it switches to **TRUNCATE Mode** (full refresh).

This can result in 99%+ reduction in data transfer for tables with minimal changes.

### Smart Strategies
You are not limited to just "all or nothing". You can exclude specific tables (e.g., `Sys*`, `*Staging`) or write custom SQL to fetch only relevant data (e.g., specific `DataAreaId` or partition).

### Performance
- **Parallel Execution**: Uses multiple workers to process tables concurrently.
- **Bulk Insert**: Uses `SqlBulkCopy` for high-throughput data insertion.
- **Context-aware Cleanup**: Smartly disables triggers and updates sequences automatically.

## Summary

This tool significantly reduces the friction of getting fresh data into your local VM.

You can download the **D365FO-DB-Copy** from the GitHub repository:  
[https://github.com/TrudAX/D365FO-DB-Copy](https://github.com/TrudAX/D365FO-DB-Copy)

If you find it useful or have suggestions, feel free to open an issue or contribute!
