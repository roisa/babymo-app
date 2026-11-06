import XCTest

/// End-to-end UI tests for the native Baby Mo app (XCUIAutomation).
final class BabyMoUITests: XCTestCase {

    override func setUp() {
        continueAfterFailure = false
    }

    /// An element with this label anywhere in the hierarchy (SwiftUI exposes
    /// text sometimes as StaticText, sometimes as part of a Button/Link label).
    private func anyElement(_ app: XCUIApplication, labeled label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(
            NSPredicate(format: "label == %@", label)
        ).firstMatch
    }

    /// Fresh install path: onboarding appears and completing it lands on Home.
    /// (If a profile already exists locally, onboarding is skipped — the test
    /// then just verifies Home renders.)
    func testOnboardingFlowReachesHome() {
        let app = XCUIApplication()
        app.launch()

        let startButton = app.buttons["Mulai Belajar"]
        if startButton.waitForExistence(timeout: 5) {
            startButton.tap()
        }

        XCTAssertTrue(
            anyElement(app, labeled: "Assalamualaikum,").waitForExistence(timeout: 5),
            "Home greeting should appear after onboarding"
        )
    }

    /// Seeded path: the parents' corner opens from Home's toolbar button.
    func testParentDashboardOpensFromHomeToolbar() {
        let app = XCUIApplication()
        app.launchArguments = ["--seed-profile"]
        app.launch()

        let parentButton = app.buttons["open-parent-dashboard"]
        XCTAssertTrue(parentButton.waitForExistence(timeout: 8), "Parent toolbar button should exist on Home")
        parentButton.tap()

        XCTAssertTrue(
            anyElement(app, labeled: "Pencapaian").waitForExistence(timeout: 5),
            "Parent dashboard should show the achievements section"
        )
    }

    /// Seeded path: the games tab lists activities from the catalog.
    func testGamesTabShowsCatalog() {
        let app = XCUIApplication()
        app.launchArguments = ["--seed-profile"]
        app.launch()

        let gamesTab = app.tabBars.buttons["Game"]
        if gamesTab.waitForExistence(timeout: 8) {
            gamesTab.tap()
        } else {
            // iPad sidebar row (explicit identifier)
            let sidebarGames = app.buttons["sidebar-games"]
            XCTAssertTrue(sidebarGames.waitForExistence(timeout: 5), "iPad sidebar should list Game")
            sidebarGames.tap()
        }

        XCTAssertTrue(
            anyElement(app, labeled: "Tebak Pasangan").waitForExistence(timeout: 5),
            "Games tab should list Memory Match from the catalog"
        )
    }
}
