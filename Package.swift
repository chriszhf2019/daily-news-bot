// swift-tools-version: 6.2
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "NewsBrief",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "NewsBrief",
            targets: ["NewsBrief"]
        )
    ],
    dependencies: [
        // Add any necessary dependencies here
    ],
    targets: [
        .target(
            name: "NewsBrief",
            dependencies: [],
            path: "NewsBrief",
            exclude: ["Resources"]
        )
    ]
)
