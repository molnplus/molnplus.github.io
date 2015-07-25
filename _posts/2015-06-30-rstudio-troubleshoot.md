---
title: rstudio.troubleshooting
layout: post
---

During startup - Warning messages:

    1: Setting LC_CTYPE failed, using “C”
    2: Setting LC_COLLATE failed, using “C”
    3: Setting LC_TIME failed, using “C”
    4: Setting LC_MESSAGES failed, using “C”
    5: Setting LC_PAPER failed, using “C”

## `en solution`

    1 Open Terminal
    2 Write or paste in:

    defaults write org.R-project.R force.LANG en_US.UTF-8

    3 Close Terminal
    4 Start R
