// This is a simple script to create a basic SwiftUI iOS app
// You can run this with: swift Project.swift

import Foundation

// Create the basic directory structure
let newsBriefDir = URL(fileURLWithPath: "/Users/haifangzhao/Documents/2025-app/news/NewsBrief")
let sourcesDir = newsBriefDir
let resourcesDir = newsBriefDir.appendingPathComponent("Resources")

print("Creating project structure...")

// Create Xcode project directory
let xcodeprojDir = URL(fileURLWithPath: "/Users/haifangzhao/Documents/2025-app/news/NewsBrief.xcodeproj")
try? FileManager.default.createDirectory(at: xcodeprojDir, withIntermediateDirectories: true)

// Create Info.plist
let infoPlistContent = """
<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">
<plist version=\"1.0\">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>$(DEVELOPMENT_LANGUAGE)</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>UIApplicationSupportsMultipleScenes</key>
	<false/>
	<key>UIApplicationSceneManifest</key>
	<dict>
		<key>UISceneConfigurations</key>
		<dict>
			<key>UIWindowSceneSessionRoleApplication</key>
			<array>
				<dict>
					<key>UISceneConfigurationName</key>
					<string>Default Configuration</string>
					<key>UISceneDelegateClassName</key>
					<string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>
				</dict>
			</array>
		</dict>
	</dict>
	<key>UILaunchStoryboardName</key>
	<string>LaunchScreen</string>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>arm64</string>
	</array>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UISupportedInterfaceOrientations~ipad</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationPortraitUpsideDown</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
</dict>
</plist>
"""

let infoPlistURL = newsBriefDir.appendingPathComponent("Info.plist")
try? infoPlistContent.write(to: infoPlistURL, atomically: true, encoding: .utf8)

// Create a simple SceneDelegate for compatibility
let sceneDelegateContent = """
import UIKit
import SwiftUI

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        let contentView = ContentView()

        if let windowScene = scene as? UIWindowScene {
            let window = UIWindow(windowScene: windowScene)
            window.rootViewController = UIHostingController(rootView: contentView)
            self.window = window
            window.makeKeyAndVisible()
        }
    }
}
"""

let sceneDelegateURL = newsBriefDir.appendingPathComponent("SceneDelegate.swift")
try? sceneDelegateContent.write(to: sceneDelegateURL, atomically: true, encoding: .utf8)

print("Project structure created successfully!")
print("To build and run this app, open Xcode and create a new iOS SwiftUI app project, then copy all the existing files into it.")