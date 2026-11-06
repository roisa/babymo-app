import Foundation
import UserNotifications

/// Gentle daily learning reminder on the Watch (brief §6C). One notification a
/// day, mid-afternoon, easily removable; no tracking, no sound spam.
enum ReminderService {
    private static let identifier = "babymo-daily-learning"

    static func scheduleDailyReminder(hour: Int = 16) async {
        let center = UNUserNotificationCenter.current()

        let granted = (try? await center.requestAuthorization(options: [.alert, .sound])) ?? false
        guard granted else { return }

        // Replace any previous schedule rather than stacking.
        center.removePendingNotificationRequests(withIdentifiers: [identifier])

        let content = UNMutableNotificationContent()
        content.title = "Baby Mo"
        content.body = "Waktunya belajar bareng Mo! 🌙"
        content.sound = .default

        var components = DateComponents()
        components.hour = hour
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)

        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
        try? await center.add(request)
    }
}
