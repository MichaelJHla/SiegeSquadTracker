//
//  Siege_Squad_StatsApp.swift
//  Siege Squad Stats
//
//  Created by Jonah Hlastala on 2/12/21.
//

import Firebase
import SwiftUI

@main
struct Siege_Squad_StatsApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        // Configure FirebaseApp
        FirebaseApp.configure()
        return true
    }
}
