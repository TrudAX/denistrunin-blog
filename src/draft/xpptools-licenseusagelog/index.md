---
title: "D365FO License usage log utility"
date: "2026-03-08T22:12:03.284Z"
tags: ["XppTools"]
path: "/xpptools-licenseusagelog"
featuredImage: "./logo.png"
excerpt: "This blog post describes a tool that allows you to monitor license usage"
---



In this blog post, I will describe 

## Technical details



### Independent consultants 

TODO: *describe who is working in this area with links to a web sites*

## License log usage

The tool can be installed  from [GitHub](https://github.com/TrudAX/XppTools/tree/master/DEVTools/DEVLicenseUtils). It should work for couple of weeks on a PROD database to get some usefull values. 

### Enable element usage logs

Enable logging, in case of Summary a system creates element usage log for a user only once per user session. 

![Usage monitory](UsageLogSetup.png)

The following elements are [logged](https://github.com/TrudAX/XppTools/blob/master/DEVTools/DEVLicenseUtils/AxClass/DEVLicenseElementUsageLogMonitor.xml):

- Form opening(the same extension point as standard Microsoft "Form runs (Page views)"  telemetry )

- Sysoperation execution(this includes reports and actions)

- FormLetter executions (this includes sales and purch orders posting)

- RunBase classes execution 

![User element usage log](UserElementUsageLog.png)

### Calculate modified tables

One of the challenges of license monitoring is determining whether the user is viewing a form or actually modifying data. We can get a modification event from 2 sources:

- Table **ModifiedBy**, **CreatedBy** fields. This is not fully reliable info, as it contains only the last user who touched the record
- **SysDatabaseLog** table - this produces more actual info, but it needs to be enabled in advance

![Modified table calculate](ModifiedTablesCalc.png)

The tool allows you to specify a period(e.g. last 90 days) and update the modification information from the 2 sources above 

The next challenge is to link the Form the user is using to a list of tables. The License tool automatically calculates this data by linking all form DataSources with the used MenuItem, but this link can also be corrected manually.

## Running license usage report

After you get the element usage a log and calculated tables modification, you can finally run a User license report

![License usage report](LicenseUsageReport.png)

It contains 2 section - header and lines

The header section is one line per user and contains the following fields:

TODO : describe fields

Lines section:

TODO : describe fields

## Analysing the license report data

This report analyses **users** by comparing their **Assigned license level("License" column)** with their **actual system usage("Usage log license" column)**, based on captured activity logs and entitlement objects.

Let's consider possible analysis scenarios based on the **Compare status** field

### **Match** status

The assigned license corresponds to the user’s actual system activity.

**Technical meaning:**

- User accesses allocated menu items.
- Logged operations confirm required access level (including write where applicable).
- Assigned SKU aligns with required entitlement objects.

Example1

![Match status1](MatchStatusExample1.png)

In this example, we can see that the user has access to **Work** and **Waves** forms and writes to the relevant tables, so it is a valid "**Supply Chain Management**" license; you can't optimise it.

Example2

![Match status example 2](MatchStatusExample2.png)

This example is more interesting. User is using only TMSPACKINGLIST report; for some reason, Microsoft has made it an Enterprise-level license in the current version(previously it was Activity). This information gives you some options to reduce licensing, e.g. develop your own report or provide it to the user in a different way.

### **Match – Write Not Confirmed Status** 

User accesses functionality within their assigned license, but no write operations were captured for related tables.

**Technical meaning:**

- User uses menu items.
- Access level matches allocated license.
- However, no logged database writes were 



## Summary

License usage log utility can help you to understand how user using the system and adjust licenses 

The tool can be downloaded from the  [GitHub](https://github.com/TrudAX/XppTools/tree/master/DEVTools/DEVLicenseUtils) .

It will be interesting to see the feedback, e.g. : 

- Are currenly logged operations provides clear view on the license usage or something else required
- Some guidencense that you can share with the community on how to adjust roles based on the tool output 

I hope you found this post helpful. As always, if you have any suggestions for improvements or questions regarding this implementation, please don't hesitate to reach out.
