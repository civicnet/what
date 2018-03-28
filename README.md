# what [![Build Status](https://travis-ci.org/civictechro/what.svg?branch=master)](https://travis-ci.org/civictechro/what) [![Coverage Status](https://coveralls.io/repos/github/civictechro/what/badge.svg)](https://coveralls.io/github/civictechro/what)

A stable, balanced template engine

## Stability

* any data can be compiled as a template; safe to use without prior validation

* data that is missing, falsy, or can't be represented as a string (e.g. `Object.create(null)`) is output as an empty string

* any error thrown while accesing data (i.e. getters, generators, proxies) will be propagated unchanged

## Performance

Check performance on your setup using:

```
node ./node_modules/@civictech/what/benchmark.js [<ms>]
```

By default spends 10 seconds/test, for a total of about 5 minutes.

Sample output:

```
┌──────────────────┬──────────────┬──────────────┬───────────┬───────────┬─────────────┐
│       Test       │   Compiled   │   Rendered   │   Input   │  Results  │  Data rate  │
├──────────────────┼──────────────┼──────────────┼───────────┼───────────┼─────────────┤
│ 00.nothing       │   47,197 s⁻¹ │  437,106 s⁻¹ │    0.0  B │    0.0  B │    0.0  B/s │
│ 01.sentence      │   47,347 s⁻¹ │  428,728 s⁻¹ │   83.0  B │   83.0  B │   35.6 MB/s │
│ 02.paragraph     │   47,353 s⁻¹ │  429,866 s⁻¹ │  567.0  B │  567.0  B │  243.7 MB/s │
│ 03.page          │   41,753 s⁻¹ │  429,057 s⁻¹ │    6.1 kB │    6.1 kB │    2.6 GB/s │
│ 04.rfc           │    3,852 s⁻¹ │  398,984 s⁻¹ │  432.1 kB │  432.1 kB │  172.4 GB/s │
│ 05.book          │      319 s⁻¹ │  427,281 s⁻¹ │    5.6 MB │    5.6 MB │    2.4 TB/s │
│ 10.read-1        │   28,607 s⁻¹ │  351,284 s⁻¹ │    4.0  B │    1.0  B │  351.3 kB/s │
│ 11.read-10       │   13,893 s⁻¹ │  204,019 s⁻¹ │   41.0  B │   10.0  B │    2.0 MB/s │
│ 12.read-100      │    2,354 s⁻¹ │   38,247 s⁻¹ │  492.0  B │  100.0  B │    3.8 MB/s │
│ 13.read-1k       │      204 s⁻¹ │    3,890 s⁻¹ │    5.9 kB │    1.0 kB │    3.9 MB/s │
│ 14.seek-1x1k     │      986 s⁻¹ │   29,122 s⁻¹ │    4.9 kB │    1.0  B │   29.1 kB/s │
│ 15.seek-10x100   │      978 s⁻¹ │   31,724 s⁻¹ │    3.9 kB │   10.0  B │  317.2 kB/s │
│ 16.seek-100x10   │      807 s⁻¹ │   17,035 s⁻¹ │    3.2 kB │  100.0  B │    1.7 MB/s │
│ 17.if-else-1     │   21,591 s⁻¹ │  160,840 s⁻¹ │    9.0  B │    1.0  B │  160.8 kB/s │
│ 18.if-else-10    │    6,050 s⁻¹ │   47,147 s⁻¹ │   90.0  B │   10.0  B │  471.5 kB/s │
│ 19.if-else-100   │      966 s⁻¹ │    5,648 s⁻¹ │  900.0  B │  100.0  B │  564.9 kB/s │
│ 20.array-0       │   20,592 s⁻¹ │  168,595 s⁻¹ │   20.0  B │    0.0  B │    0.0  B/s │
│ 21.array-1       │   17,775 s⁻¹ │  128,684 s⁻¹ │   20.0  B │    1.0  B │  128.7 kB/s │
│ 22.array-10      │   18,733 s⁻¹ │   60,187 s⁻¹ │   21.0  B │   10.0  B │  601.9 kB/s │
│ 23.array-100     │   11,973 s⁻¹ │    5,850 s⁻¹ │   22.0  B │  100.0  B │  585.0 kB/s │
│ 24.array-1k      │   16,790 s⁻¹ │      718 s⁻¹ │   23.0  B │    1.0 kB │  718.5 kB/s │
│ 25.gen-0         │   18,487 s⁻¹ │  107,028 s⁻¹ │   20.0  B │    0.0  B │    0.0  B/s │
│ 26.gen-1         │   17,650 s⁻¹ │   92,085 s⁻¹ │   22.0  B │    1.0  B │   92.1 kB/s │
│ 27.gen-10        │   18,073 s⁻¹ │   45,275 s⁻¹ │   23.0  B │   10.0  B │  452.8 kB/s │
│ 28.gen-100       │   16,181 s⁻¹ │    7,456 s⁻¹ │   24.0  B │  100.0  B │  745.6 kB/s │
│ 29.gen-1k        │   17,566 s⁻¹ │      871 s⁻¹ │   25.0  B │    1.0 kB │  871.6 kB/s │
│ 30.mail          │   11,896 s⁻¹ │  204,362 s⁻¹ │  143.0  B │  196.0  B │   40.1 MB/s │
│ 31.html          │    4,833 s⁻¹ │   22,307 s⁻¹ │    1.2 kB │    1.5 kB │   33.1 MB/s │
└──────────────────┴──────────────┴──────────────┴───────────┴───────────┴─────────────┘
```