---
title: "sfcentralities: Calculating centralities from sf objects"
layout: post
date: 2026-03-10
---

While I generally like to work with the `sf` library in R, it is unfortunate that the R ecosystem when it comes to spatial data is quite heterogeneous: Available spatial formats do not only include vector and raster data, but the structures in which they are stored are also usually heavily influenced by the design choices of authors of certain packages:

1. [`sp`](https://cran.r-project.org/package=sp), probably the first widely used spatial package in R - at least, it is among the older ones, and [`sf`](https://r-spatial.github.io/sf/), which is often treated as its successor.
2. [`spatstat`](https://spatstat.org/), a package by the authors of "Spatial Point Patterns: Methodology and Applications with R"
3. [`terra`](https://rspatial.github.io/terra/) is more often used for raster data, but also has capabilities to handle vector data, and is, in many ways, a successor to the [`raster`](https://cran.r-project.org/package=raster) package

...and then there is the option to store coordinates in an ordinary R dataframe with columns named 'Longitude' and 'Latitude' or 'X' and 'Y' and ignore spatial packages entirely.

These are just the packages and ways to work with spatial data I encountered most frequently. And spatio-temporal analysis is also growing more common (anyone interested in this field: I highly recommend taking a look at the [`stars`](https://r-spatial.github.io/stars/) package).

I think it is an unfortunate situation for beginners who aim to perform spatial analysis in R. Even if you have some experience, especially if it is in one package, working with another package can feel like starting from zero again. Many authors have valid reasons for their design choices, and there is a growing awareness of the issue; many packages also contain functions to transform data from one format to the other. But sometimes, I find functions implemented in packages that do not see themselves as 'spatial' to begin with.

For example, when I tried to find out how to calculate the geometric median in R, the R package that appeared first in the search results was [`pracma`](https://cran.r-project.org/package=pracma) - Practical Numerical Math Functions. The package is impressive for the breadth of functions it covers, but this result also shows how different the contexts are in which functions are used. The geometric median can be used by geographers to find a central point on the map, but is also used, for example, in principal component analysis - which is an entirely different story. There are even more packages in R which offer functions for the calculation of geometric medians - [`Gmedian`](https://cran.r-project.org/package=Gmedian), for example, which is particularly optimized for high-dimensional, large datasets and very fast due to its reliance on C++. So many users of the geometric median do not analyse spatial data.

But I did, for a project, and this is a part of where [`sfcentralities`](https://github.com/InaKrapp/sfcentralities) (more precisely: the function `st_geo_median`) comes from. It takes `sf` objects as input, it gives `sf` objects as output, it is not reinventing the wheel, but beginner-friendly and easy to use - at least I hope so. But it is not entirely a package purely written with convenience in mind: Since spatial data can be in projected or geographic coordinates, using purely-number based implementations like `pracma` or `Gmedian`, which can not properly handle longitude and latitude values can give wrong results - `sfcentralities` will give an error if the user attempts it.

Why can other packages give wrong results? Because distances in the longitude-latitude-system are not constant: One degree corresponds to a different distance in meters depending on if you are at the equator or at the poles. So, despite the sometimes complex implementations of these packages, there are good reasons to use spatial packages for spatial data.

`sfcentralities` is also a bit of an attempt to bridge the gap between `sf` and the [`dodgr`](https://github.com/UrbanAnalyst/dodgr) package. `dodgr` is one of the packages that just show how powerful R can be. `dodgr` stands for 'Distances on Directed Graphs', and while it can take `sf` objects as input and even offers a function to download data from OpenStreetMap in `sf` format to use for analysis, it also heavily builds on its own data format, [`silicate`](https://cran.r-project.org/package=silicate). It allows very fast and precise distance and time calculations even in complex street networks, since it is able to take into account different modes of transport, one-way streets and other factors that go beyond a simple 'distance in kilometers/miles' measure.

I have been using it to calculate a similar measure to the geometric median - a measure which minimizes the sum of distances to points - along a street network. This is not really equivalent to the geometric median because it does not necessarily fulfill a global optimality condition - I can say that the geometric median is the point which minimizes the sum of distances to all points in a set since the geometric median is calculated using Euclidean (straight-line) distances. For a network distance, I can only say that a certain point I evaluated has a higher closeness than other points I evaluated. This is the closeness centrality, and in `sfcentralities`, it is implemented in the function `st_closeness_centrality`.

