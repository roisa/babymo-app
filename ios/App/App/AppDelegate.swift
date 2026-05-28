import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var splashOverlay: UIView?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        DispatchQueue.main.async {
            self.presentSplashOverlay(retries: 12)
        }
        return true
    }

    private func resolveWindow() -> UIWindow? {
        if let w = self.window { return w }
        for scene in UIApplication.shared.connectedScenes {
            guard let windowScene = scene as? UIWindowScene else { continue }
            if let keyWindow = windowScene.windows.first(where: { $0.isKeyWindow }) {
                return keyWindow
            }
            if let first = windowScene.windows.first {
                return first
            }
        }
        return nil
    }

    private func presentSplashOverlay(retries: Int) {
        guard let window = resolveWindow() else {
            if retries > 0 {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    self.presentSplashOverlay(retries: retries - 1)
                }
            }
            return
        }
        if splashOverlay != nil { return }

        let bg = UIColor(red: 11.0/255.0, green: 28.0/255.0, blue: 18.0/255.0, alpha: 1.0)
        let cream = UIColor(red: 240.0/255.0, green: 232.0/255.0, blue: 216.0/255.0, alpha: 1.0)
        let gold = UIColor(red: 201.0/255.0, green: 162.0/255.0, blue: 95.0/255.0, alpha: 1.0)

        let splash = UIView(frame: window.bounds)
        splash.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        splash.backgroundColor = bg

        let logoView = UIImageView()
        if let path = Bundle.main.path(forResource: "Logo_Baby_Mo_Transparant", ofType: "png", inDirectory: "public"),
           let image = UIImage(contentsOfFile: path) {
            logoView.image = image
        }
        logoView.contentMode = .scaleAspectFit
        logoView.translatesAutoresizingMaskIntoConstraints = false
        splash.addSubview(logoView)

        let tagline = UILabel()
        tagline.text = "Belajar islami bareng Mo"
        tagline.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        tagline.textColor = cream.withAlphaComponent(0.75)
        tagline.translatesAutoresizingMaskIntoConstraints = false
        splash.addSubview(tagline)

        let dotsStack = UIStackView()
        dotsStack.axis = .horizontal
        dotsStack.spacing = 8
        dotsStack.alignment = .center
        dotsStack.translatesAutoresizingMaskIntoConstraints = false
        splash.addSubview(dotsStack)

        for i in 0..<3 {
            let dot = UIView()
            dot.backgroundColor = gold
            dot.layer.cornerRadius = 4
            dot.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                dot.widthAnchor.constraint(equalToConstant: 8),
                dot.heightAnchor.constraint(equalToConstant: 8)
            ])
            dotsStack.addArrangedSubview(dot)

            let pulse = CABasicAnimation(keyPath: "opacity")
            pulse.fromValue = 0.25
            pulse.toValue = 1.0
            pulse.duration = 0.55
            pulse.autoreverses = true
            pulse.repeatCount = .infinity
            pulse.beginTime = CACurrentMediaTime() + Double(i) * 0.18
            dot.layer.add(pulse, forKey: "pulse")
        }

        NSLayoutConstraint.activate([
            logoView.centerXAnchor.constraint(equalTo: splash.centerXAnchor),
            logoView.centerYAnchor.constraint(equalTo: splash.centerYAnchor, constant: -40),
            logoView.widthAnchor.constraint(equalToConstant: 150),
            logoView.heightAnchor.constraint(equalToConstant: 150),

            tagline.centerXAnchor.constraint(equalTo: splash.centerXAnchor),
            tagline.topAnchor.constraint(equalTo: logoView.bottomAnchor, constant: 18),

            dotsStack.centerXAnchor.constraint(equalTo: splash.centerXAnchor),
            dotsStack.topAnchor.constraint(equalTo: tagline.bottomAnchor, constant: 28)
        ])

        let logoPulse = CABasicAnimation(keyPath: "transform.scale")
        logoPulse.fromValue = 1.0
        logoPulse.toValue = 1.06
        logoPulse.duration = 1.3
        logoPulse.autoreverses = true
        logoPulse.repeatCount = .infinity
        logoPulse.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        logoView.layer.add(logoPulse, forKey: "logoPulse")

        window.addSubview(splash)
        self.splashOverlay = splash

        DispatchQueue.main.asyncAfter(deadline: .now() + 2.6) {
            self.dismissSplashOverlay()
        }
    }

    private func dismissSplashOverlay() {
        guard let splash = self.splashOverlay else { return }
        UIView.animate(withDuration: 0.45, animations: {
            splash.alpha = 0
        }) { _ in
            splash.removeFromSuperview()
            self.splashOverlay = nil
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
