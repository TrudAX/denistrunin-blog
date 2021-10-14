---
title: "Working with LedgerDimension values from posted transactions in D365FO"
date: "2021-10-14T22:12:03.284Z"
tags: ["DEVTutorial", "X++"]
path: "/xpptutorial-postedledgerdim"
featuredImage: "./logo.png"
excerpt: "This post describes a case to consider while working with LedgerDimension values from posted transactions."
---

Recently we faced and fixed an interesting bug. We had a custom procedure that reversed a posted ledger journal. The logic of this procedure is quite simple - take the existing values from **LedgetDimension** fields for posted lines and create the same transactions but with the negative amount.

So the simplified version of the code looked like this:

```csharp
debitAccount  = ledgerJournalTransSource.LedgerDimension;
creditAccount  = ledgerJournalTransVariance.LedgerDimension;
//Do the posting using these account
```

Then suddenly it stopped working with the following error:

*Ledger account with 511-323-300 with record ID 1111 does not match the current account and/or advanced rule structure associated with structure*

After some troubleshooting, we found out that the customer recently had updated settings for Ledger account structures.

In X++ a **LedgerDimension** type is a reference to 3 entities:

- Dimension structure
- Ledger default account
- Default dimension

 So the error basically said that we couldn't use the same Dimension structure again.

The fix was quite simple - extract a **Default account** and **Default dimension** from the old **LedgerDimension** value and create a new **LedgerDimension** using these extracted values:  

```csharp

debitAccount  = LedgerDimensionFacade::serviceCreateLedgerDimension(              LedgerDefaultAccountHelper::getDefaultAccountFromLedgerDimension(DebitAccount),
LedgerDimensionFacade::getDefaultDimensionFromLedgerDimension(DebitAccount));

creditAccount  = LedgerDimensionFacade::serviceCreateLedgerDimension(
LedgerDefaultAccountHelper::getDefaultAccountFromLedgerDimension(CreditAccount),
LedgerDimensionFacade::getDefaultDimensionFromLedgerDimension(CreditAccount));
```

After this change, the posting was successful. It was quite a tricky fix, hard to see at first.

So, I am trying to maintain a helper class that contains references to common ledger dimension operations(like in this post), feel free to check it and comment if something is missing. <https://github.com/TrudAX/XppTools/blob/master/DEVCommon/DEVCommon/AxClass/DEVDimensionHelper.xml>
