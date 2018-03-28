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
┌────────────────┬───────────┬────────────┬──────────┬──────────┬────────────┐
│      Test      │  Compile  │  Rendered  │ Template │  Output  │ Throughput │
├────────────────┼───────────┼────────────┼──────────┼──────────┼────────────┤
│ 00.nothing     │ 37,257 /s │ 444,521 /s │   0.0  B │   0.0  B │   0.0  B/s │
│ 01.sentence    │ 47,692 /s │ 426,754 /s │  83.0  B │  83.0  B │  35.4 MB/s │
│ 02.paragraph   │ 46,524 /s │ 429,127 /s │ 567.0  B │ 567.0  B │ 243.3 MB/s │
│ 03.page        │ 41,747 /s │ 429,055 /s │   6.1 kB │   6.1 kB │   2.6 GB/s │
│ 04.rfc         │  3,911 /s │ 431,291 /s │ 432.1 kB │ 432.1 kB │ 186.4 GB/s │
│ 05.book        │    313 /s │ 431,153 /s │   5.6 MB │   5.6 MB │   2.4 TB/s │
│ 10.read-1      │ 28,081 /s │ 351,115 /s │   4.0  B │   1.0  B │ 351.1 kB/s │
│ 11.read-10     │ 13,730 /s │ 203,863 /s │  41.0  B │  10.0  B │   2.0 MB/s │
│ 12.read-100    │  2,275 /s │  38,582 /s │ 492.0  B │ 100.0  B │   3.9 MB/s │
│ 13.read-1k     │    202 /s │   3,931 /s │   5.9 kB │   1.0 kB │   3.9 MB/s │
│ 14.seek-1x1k   │    975 /s │  28,916 /s │   4.9 kB │   1.0  B │  28.9 kB/s │
│ 15.seek-10x100 │    934 /s │  30,224 /s │   3.9 kB │  10.0  B │ 302.2 kB/s │
│ 16.seek-100x10 │    775 /s │  16,073 /s │   3.2 kB │ 100.0  B │   1.6 MB/s │
│ 17.if-else-1   │ 21,593 /s │ 239,681 /s │   9.0  B │   1.0  B │ 239.7 kB/s │
│ 18.if-else-10  │  6,957 /s │  57,943 /s │  90.0  B │  10.0  B │ 579.4 kB/s │
│ 19.if-else-100 │    917 /s │   7,304 /s │ 900.0  B │ 100.0  B │ 730.4 kB/s │
│ 20.array-0     │ 22,064 /s │ 236,756 /s │  20.0  B │   0.0  B │   0.0  B/s │
│ 21.array-1     │ 21,655 /s │ 195,978 /s │  20.0  B │   1.0  B │ 196.0 kB/s │
│ 22.array-10    │ 21,677 /s │  71,045 /s │  21.0  B │  10.0  B │ 710.5 kB/s │
│ 23.array-100   │ 21,702 /s │   8,939 /s │  22.0  B │ 100.0  B │ 893.9 kB/s │
│ 24.array-1k    │ 20,824 /s │     888 /s │  23.0  B │   1.0 kB │ 888.8 kB/s │
│ 25.gen-0       │ 21,869 /s │ 124,621 /s │  20.0  B │   0.0  B │   0.0  B/s │
│ 26.gen-1       │ 21,782 /s │ 109,378 /s │  22.0  B │   1.0  B │ 109.4 kB/s │
│ 27.gen-10      │ 20,715 /s │  53,889 /s │  23.0  B │  10.0  B │ 538.9 kB/s │
│ 28.gen-100     │ 18,080 /s │   7,356 /s │  24.0  B │ 100.0  B │ 735.6 kB/s │
│ 29.gen-1k      │ 20,492 /s │     999 /s │  25.0  B │   1.0 kB │ 999.6 kB/s │
│ 30.mail        │ 14,055 /s │ 228,538 /s │ 143.0  B │ 196.0  B │  44.8 MB/s │
│ 31.html        │  5,484 /s │  29,646 /s │   1.2 kB │   1.5 kB │  43.9 MB/s │
└────────────────┴───────────┴────────────┴──────────┴──────────┴────────────┘
```