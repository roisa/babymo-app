// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "BabyMoKit",
    defaultLocalization: "id",
    platforms: [
        .iOS(.v17),
        .watchOS(.v10),
        // macOS included only so the package is compile-verifiable via `swift build`
        // from the command line; the app ships on iOS/iPadOS/watchOS.
        .macOS(.v14)
    ],
    products: [
        .library(name: "BabyMoKit", targets: ["BabyMoKit"])
    ],
    targets: [
        .target(
            name: "BabyMoKit"
        ),
        .testTarget(
            name: "BabyMoKitTests",
            dependencies: ["BabyMoKit"]
        )
    ]
)
