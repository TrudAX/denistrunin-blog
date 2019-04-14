---
title: "Integration solution requirements"
date: "2019-03-06T22:12:03.284Z"
tags: ["TRUDScripts"]
path: "/integration-checklist"
featuredImage: "./logo.png"
excerpt: "Document contains main points to consider when designing integration solutions"
---

There are a lot of ways to implement integration with D365FO for external system. To choose the correct approach very important to clearly understand integration requirements before doing programming/setup of actual integration. In this document I propose the actual checklist of what you need to know before discussing integration implementation.

Every question in this document have a value and can dramatically change actual integration implementation

Practical experience 

Most important question here performance, from the amount of data that needs to be processed to time interval when processing should be done.

When working with multiline documents transaction support is required. For example you import 10 lines sales order from external system and 1 sales line can't be created due to some validation. In most cases you don't want to create sales order with 9 lines, the whole document should be rejected and often this behaviour implemented via SQL transaction support. Such requirement can limit the number of solutions as for example standard D365FO Data managements module doesn't support transactions, you can't write several records in transactions

![](EntityWrite.png)   

Logging and traceability should be implemented as base requirement. For export scenarios should be easy to identify what and when this particular record was exported, for import scenarios - what was the original request, it's processing status and what documents were created as the result of this processing.

Async and sync     



## The current problems

The current challenges that I saw on the projects while working with the financial dimensions framework were the following:

### Misunderstanding of the concept

There is no starting point if you want to learn Financial dimensions framework. The best I found is the original [Implementing the Account and Financial Dimensions Framework for Microsoft Dynamics AX 2012 Applications](http://download.microsoft.com/download/4/e/3/4e36b655-568e-4d4a-b161-152b28baaf30/implementing_the_account_and_financial_dimensions_framework_ax2012.pdf) whitepaper that explains the concept, but its content is quite outdated for D365FO. GitHub [request](https://github.com/MicrosoftDocs/dynamics-365-unified-operations-public/issues/236) to update this document was closed, standard D365FO [Financials development home page](https://docs.microsoft.com/en-us/dynamics365/unified-operations//dev-itpro/financial/financial-dev-home-page) contains some really specific information and no basic overview.



## Summary

You can download this class using the following link https://github.com/TrudAX/XppTools/blob/master/DEVCommon/DEVCommon/AxClass/DEVDimensionHelper.xml

If you know some other methods that can be added into this class feel free to create a GitHub pull request or leave a comment.
