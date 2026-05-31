//
//  NewsBriefApp.swift
//  NewsBrief
//
//  Created by haifangzhao on 2025-01-01.
//

import SwiftUI

@main
struct NewsBriefApp: App {
    @StateObject private var newsViewModel = NewsViewModel()
    @StateObject private var favoritesManager = FavoritesManager()
    @StateObject private var loginManager = LoginManager()
    @StateObject private var noteManager = NoteManager()
    
    init() {
        // 在 init 中设置外观，避免在 onAppear 中重复设置
        setupAppAppearance()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(newsViewModel)
                .environmentObject(favoritesManager)
                .environmentObject(loginManager)
                .environmentObject(noteManager)
        }
    }
    
    private func setupAppAppearance() {
        // 配置应用整体外观
        let navBarAppearance = UINavigationBarAppearance()
        navBarAppearance.configureWithOpaqueBackground()
        navBarAppearance.backgroundColor = UIColor(red: 0.05, green: 0.2, blue: 0.4, alpha: 1.0)
        navBarAppearance.titleTextAttributes = [.foregroundColor: UIColor.white]
        navBarAppearance.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
        
        UINavigationBar.appearance().standardAppearance = navBarAppearance
        UINavigationBar.appearance().compactAppearance = navBarAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navBarAppearance
        
        // 配置标签栏外观
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithOpaqueBackground()
        tabBarAppearance.backgroundColor = UIColor(red: 0.05, green: 0.2, blue: 0.4, alpha: 1.0)
        tabBarAppearance.stackedLayoutAppearance.normal.titleTextAttributes = [.foregroundColor: UIColor.white]
        tabBarAppearance.stackedLayoutAppearance.selected.titleTextAttributes = [.foregroundColor: UIColor.white]
        
        UITabBar.appearance().standardAppearance = tabBarAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
    }
}

// 全局收藏管理器
class FavoritesManager: ObservableObject {
    @Published var favoriteNewsIDs: Set<String> = []
    @Published var isFavorite: Bool = false
    
    private let favoritesKey = "favoriteNewsIDs"
    
    init() {
        // 延迟加载收藏数据，避免阻塞启动
        DispatchQueue.global(qos: .utility).async { [weak self] in
            self?.loadFavorites()
        }
    }
    
    func toggleFavorite(newsID: String) {
        if favoriteNewsIDs.contains(newsID) {
            favoriteNewsIDs.remove(newsID)
        } else {
            favoriteNewsIDs.insert(newsID)
        }
        saveFavorites()
    }
    
    func isNewsFavorited(_ newsID: String) -> Bool {
        return favoriteNewsIDs.contains(newsID)
    }
    
    func clearAllFavorites() {
        favoriteNewsIDs.removeAll()
        saveFavorites()
    }
    
    private func saveFavorites() {
        if let data = try? JSONEncoder().encode(Array(favoriteNewsIDs)) {
            UserDefaults.standard.set(data, forKey: favoritesKey)
        }
    }
    
    private func loadFavorites() {
        if let data = UserDefaults.standard.data(forKey: favoritesKey),
           let savedIDs = try? JSONDecoder().decode([String].self, from: data) {
            DispatchQueue.main.async { [weak self] in
                self?.favoriteNewsIDs = Set(savedIDs)
            }
        }
    }
}

// 笔记模型
struct Note: Identifiable, Codable {
    let id: String
    let newsID: String
    var content: String
    var summary: String
    var createdAt: Date
    var updatedAt: Date
    
    init(newsID: String, content: String = "", summary: String = "") {
        self.id = UUID().uuidString
        self.newsID = newsID
        self.content = content
        self.summary = summary
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}

// 笔记管理器
class NoteManager: ObservableObject {
    @Published var notes: [Note] = []
    
    private let notesKey = "notes"
    
    init() {
        // 延迟加载笔记数据，避免阻塞启动
        DispatchQueue.global(qos: .utility).async { [weak self] in
            self?.loadNotes()
        }
    }
    
    func getNote(for newsID: String) -> Note? {
        return notes.first { $0.newsID == newsID }
    }
    
    func saveNote(_ note: Note) {
        if let index = notes.firstIndex(where: { $0.id == note.id }) {
            notes[index] = note
        } else {
            notes.append(note)
        }
        saveNotes()
    }
    
    func deleteNote(_ note: Note) {
        notes.removeAll { $0.id == note.id }
        saveNotes()
    }
    
    private func saveNotes() {
        if let data = try? JSONEncoder().encode(notes) {
            UserDefaults.standard.set(data, forKey: notesKey)
        }
    }
    
    private func loadNotes() {
        if let data = UserDefaults.standard.data(forKey: notesKey),
           let savedNotes = try? JSONDecoder().decode([Note].self, from: data) {
            DispatchQueue.main.async { [weak self] in
                self?.notes = savedNotes
            }
        }
    }
}