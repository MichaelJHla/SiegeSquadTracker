//
//  SquadViewModel.swift
//  Siege Squad Stats
//
//  Created by Jonah Hlastala on 2/12/21.
//

import Firebase
import Foundation

class Squad: ObservableObject {
    private var ref: DatabaseReference!
    @Published var squadName: String
    @Published var admin: String?
    
    //This initializer gets the squad name and assigns all compnenets of the squad to variables
    init(_ squadName: String) {
        self.squadName = squadName
        fetchData()
    }
    
    func fetchData() {
        ref = Database.database().reference().child("squads/" + squadName)
        ref.child("admin").observe(DataEventType.value, with: { (snapshot) in
            self.admin = snapshot.value as? String
        })
    }
}
