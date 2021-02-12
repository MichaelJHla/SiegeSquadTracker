//
//  ContentView.swift
//  Siege Squad Stats
//
//  Created by Jonah Hlastala on 2/12/21.
//

import SwiftUI

struct ContentView: View {
    @ObservedObject var curSquad = Squad("Goop Gang")
            
    var body: some View {
        NavigationView {
            Text(curSquad.admin ?? "NO DATA")
        }
        .onAppear() {
            curSquad.fetchData()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
