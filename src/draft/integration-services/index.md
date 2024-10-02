---
title: "Implement Sync integration using D365FO services"
date: "2024-09-12T22:12:03.284Z"
tags: ["Integration", "XppDEVTutorial"]
path: "/integration-services"
featuredImage: "./logo.png"
excerpt: "This blog post describes how to implement a synchronous integration with D365FO by creating a Service inside D365FO using External integration framework"
---

**External integration** is a [framework](https://github.com/TrudAX/XppTools?tab=readme-ov-file#devexternalintegration-submodel) designed for inbound and outbound integrations in D365FO. It supports several channels: Azure file share, SFTP, Azure service bus, and provides comprehensive features for logging, error handling, and troubleshooting.

In this blog post, I will describe how to implement event-based data export to the external web service. I will show it on a a simplified example but the approach is based on real-life integrations , and provided implementation contains common elements that contains some reusable code for similar tasks.  

## Main development principles 

Input contract can be a custom class different per integration

Output contract is a unified class that contains the following data: A .NET dataset containing 0..n tables, Output string, Error flag, Error message

We want to provide different log options.

It should be possible to test the class inside D365FO



## Summary

In this post, I have described different types of periodic exports to file from Dynamics 365 Finance and Operations based on the **External Integration** framework. We discussed the following exports:

- Simple SQL query export
- Export based on custom X++ code and query settings
- Incremental X++ export

All used classes can be found on [GitHub](https://github.com/TrudAX/XppTools/tree/master/DEVTutorial/DEVExternalIntegrationSamples) and can be used as a starting point for your own integrations.

I hope you find this information useful. As always, if you see any improvements, suggestions, or have questions about this work, don't hesitate to contact me.

