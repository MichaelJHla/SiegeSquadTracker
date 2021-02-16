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
            VStack {
                Text("Squad data")
                    .font(.headline)
                Text("Squad name: " + curSquad.squadName)
                Text(curSquad.admin ?? "NO ADMIN")
                Text(curSquad.password ?? "NO PASSWORD")
            }
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
