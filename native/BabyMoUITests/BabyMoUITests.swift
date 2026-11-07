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

        // A tap right after launch can be swallowed while the window settles —
        // retry once before failing.
        var found = anyElement(app, labeled: "Pencapaian").waitForExistence(timeout: 8)
        if !found, parentButton.isHittable {
            parentButton.tap()
            found = anyElement(app, labeled: "Pencapaian").waitForExistence(timeout: 8)
        }
        XCTAssertTrue(found, "Parent dashboard should show the achievements section")
    }

    /// Web hub: the Prayer tab must show the prayer-times hub, which only
    /// renders when /bm-prayer.js loads through the custom URL scheme (it is
    /// referenced with a site-root absolute path that breaks under file://).
    func testPrayerTabShowsPrayerTimesHub() {
        let app = XCUIApplication()
        app.launch()

        // First run shows the web language chooser; pick Indonesian. The web
        // button exposes its full text including the flag emoji ("🇮🇩 Bahasa
        // Indonesia Belajar Islam sambil bermain"), so match by substring.
        let indonesian = app.descendants(matching: .any).matching(
            NSPredicate(format: "label CONTAINS 'Bahasa Indonesia'")
        ).firstMatch
        if indonesian.waitForExistence(timeout: 8), indonesian.isHittable {
            indonesian.tap()
        }

        // Bottom web nav tab is "Sholat" (id) or "Prayer" (en).
        let sholatTab = anyElement(app, labeled: "Sholat")
        let prayerTab = anyElement(app, labeled: "Prayer")
        if sholatTab.waitForExistence(timeout: 8) {
            sholatTab.tap()
        } else {
            XCTAssertTrue(prayerTab.waitForExistence(timeout: 5), "Prayer tab should exist in the web bottom nav")
            prayerTab.tap()
        }

        // Before a location is chosen the hub shows its empty state ("Kapan
        // waktu sholat?" / "When is it time to pray?"). That text is written
        // into #prayerHub by bm-prayer.js — it appears only if the script
        // actually loaded, which is exactly what broke under file:// URLs.
        let hubEmptyState = app.descendants(matching: .any).matching(
            NSPredicate(format: "label CONTAINS[c] 'Kapan waktu sholat' OR label CONTAINS[c] 'When is it time to pray'")
        ).firstMatch
        XCTAssertTrue(hubEmptyState.waitForExistence(timeout: 10),
                      "Prayer tab should render the prayer-times hub from bm-prayer.js")
    }

    /// Hijaiyah Island: the in-game topbar must sit below the Dynamic Island
    /// and be tappable (its #topbar previously ignored the safe-area inset,
    /// so taps landed in the system status-bar region).
    func testHijaiyahTopbarIsTappable() {
        let app = XCUIApplication()
        app.launch()

        let contains: (String) -> XCUIElement = { text in
            app.descendants(matching: .any).matching(
                NSPredicate(format: "label CONTAINS %@", text)
            ).firstMatch
        }

        // First-run language chooser, if present. The chooser stays in the
        // DOM (hidden) after a language is saved, so require hittability.
        let indonesian = contains("Belajar Islam sambil bermain")
        if indonesian.waitForExistence(timeout: 8), indonesian.isHittable { indonesian.tap() }

        // Open the game from the hub (featured on home or via the Game tab).
        var island = contains("Pulau Hijaiyah")
        if !island.waitForExistence(timeout: 8) {
            anyElement(app, labeled: "Game").tap()
            island = contains("Pulau Hijaiyah")
            XCTAssertTrue(island.waitForExistence(timeout: 8), "Game tab should list Pulau Hijaiyah")
        }
        island.tap()

        // Start screen → (optional) first-time guide → gameplay.
        let play = contains("Mulai Petualangan")
        XCTAssertTrue(play.waitForExistence(timeout: 10), "Hijaiyah start screen should appear")
        play.tap()
        let coachGo = contains("Ayo jelajah")
        if coachGo.waitForExistence(timeout: 4) { coachGo.tap() }

        // The topbar back button must sit below the status-bar/Dynamic Island
        // gesture region (safe-area top ≈ 59pt) and respond to a real tap.
        let back = app.buttons["Kembali"]
        XCTAssertTrue(back.waitForExistence(timeout: 8), "Topbar back button should exist in-game")
        XCTAssertGreaterThan(back.frame.minY, 59, "Topbar must clear the status-bar region")
        XCTAssertTrue(back.isHittable, "Topbar back button should be hittable")
        back.tap()
        XCTAssertTrue(anyElement(app, labeled: "Beranda").waitForExistence(timeout: 8),
                      "Topbar back button should navigate back to the hub")
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
