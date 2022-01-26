---
title: "Dynamics AX performance monitoring: missing indexes"
date: "2022-01-26T22:12:03.284Z"
tags: ["Performance", "SQL", "Performance audit"]
path: "/performance-monitormisind"
featuredImage: "./logo.png"

excerpt: "The blog post describes a monitoring solution for SQL Server missing indexes."
---

Proper SQL indexes play a vital role in the performance of Dynamics AX(or D365FO on-premise). Even one query that doesn't have appropriate indexes may slow down the system and increase the load on the SQL Server. In this post, I want to describe how to implement a monitoring solution for missing indexes.

## Missing indexes example

Let's simulate the missing indexes issue. I am using a standard AX2012 Demo VM for this. For example, we need to find all vendor invoice lines related to a sales order.

![Table Browser VIT](TableBrowserVIT.png)

To do this, a developer may write the following code:

```csharp
    VendInvoiceTrans        vendInvoiceTrans;
    ;
    while select vendInvoiceTrans
        where vendInvoiceTrans.InventRefTransId == "002862"
    ...    
```

The problem is that **InventRefTransId** field is not indexed, so to get the result, SQL Server needs to scan all rows in **VendInvoiceTrans** table. Depending on where this code is used, it may affect user performance or increase the load to a SQL Server. Also, **InventRefTransId** is a highly selective field, so it is a perfect candidate for an index.

SQL Server query optimiser can automatically detect such cases and generate recommendations for index creation. These recommendations can be displayed by querying [missing index](https://github.com/TrudAX/TRUDScripts/blob/master/Performance/AX%20Technical%20Audit.md#missing-indexes) view. Moreover, analysing the output of this view is a prominent part of any [performance audit](https://denistrunin.com/performance-audit).

![Missing index recommendations](MissingIndRecommendation.png)

From some real-life experience of Dynamics AX performance optimisation, usually, it is enough to analyse 50 first rows from this view with an impact of more than 99%. Most(but not all) of such recommendations will be valid, and new indexes should be created.

But you should not automatically apply every recommendation. Here are some exceptions where you don't need to create an index even if the impact is 99%:

1. A "select" is an external query with a missing DATAAREAID/PARTITION field and a field already presented in the index: In this case, it is better to add DATAAREAID/PARTITION to such an external query.

2. There may be a lot of fields in the missing index recommendation, but not all are selective. Extensive indexes may slow down the system, so the number of fields for the new index must be minimal, you should add only selective fields to the new index.

3. A field is already presented in the index but not in the first place. A perfect example of this is **CustPackingSlipJour** table. To get a packing slip for a sales order, a Module(**RefNum**) should be specified. Usually, it contains just one value(Sales order type), and developers often forget to select it.

   ![Cust packing slip table](CustPackingJour.png)

Another variation of this case is my example with **VendInvoiceTrans** above. In this case a code contains a condition for **InventRefTransId** field but the value for **InventRefType** is not specified. This is a development error, and both fields should be specified in the code and in the index.

Let's discuss how we can automatically monitor such issues.

## Missing indexes monitoring solution implementation

Such problems are pretty easy to fix; you need to periodically check the missing indexes view. To automatically perform this task, I created the following Dynamics AX performance missing indexes  monitoring [procedure](https://github.com/TrudAX/TRUDScripts/blob/master/Performance/Jobs/SQLTopQueryMonitor/dbo.AXMissingIndexesMonitor.StoredProcedure.sql):

```sql
msdb.dbo.[AXMissingIndexesMonitor] @DBName = 'MicrosoftDynamicsAX',
@SendEmailOperator = 'axoperator', @DisplayOnlyNewRecommendation = 0, @Debug = 0
```

The idea is the following:

You create a SQL Agent job to run this procedure every day. If there are any missing indexes with 99% impact in the first 50 rows of the missing index view, the system sends an email to the person responsible for Dynamics AX performance monitoring.

![E-mail](Email.png)

The developer should always react to this email. There can be two outcomes:

- Either the index should be created(it should be done in AX application level and new application release deployed)

- Or if missing index recommendation is not valid a developer may mark it approved(set the flag **IsApproved** from **AXTopMissingIndexesLog** table)

## D365FO Cloud version

The manual monitoring is valid only for On-premise D365FO versions(based on SQL Server). The Cloud version of Dynamics 365 for Operations uses Azure SQL Database at the backend, and missing indexes are created automatically by the DAMS service. The following article is an excellent description of how the process works internally[Running 1M databases on Azure SQL for a large SaaS provider: Microsoft Dynamics 365 and Power Platform.](https://devblogs.microsoft.com/azure-sql/running-1m-databases-on-azure-sql-for-a-large-saas-provider-microsoft-dynamics-365-and-power-platform/)

## Conclusion

Using the described solution, you can monitor your Dynamics AX SQL indexes and get a notification when SQL Server identifies new recommendations. It will help to maintain a stable level of Dynamics AX performance.

The code for this can be found in the following [folder](https://github.com/TrudAX/TRUDScripts/tree/master/Performance/Jobs/SQLTopQueryMonitor). This procedure is a valuable addition to my previous monitoring solution[Monitoring the most problematic performance problem in Dynamics AX - parameters sniffing](https://denistrunin.com/performance-snifmonitor).

I hope you find this information useful. Don't hesitate to contact me in case of any questions or if you want to share your Dynamics AX/D365FO SQL monitoring approach.
