//
//  SquadViewModel.swift
//  Siege Squad Stats
//
//  Created by Jonah Hlastala on 2/12/21.
//

import Firebase
import Foundation

class Squad: ObservableObject {
    private var ref: DatabaseReference!//The database reference for the squad
    private var squadData: NSDictionary?
    @Published var squadName: String//The name of the squad
    @Published var admin: String?//The UID of the user who is the admin of the squad
    @Published var password: String?//The password used to join the squad
    @Published var members: NSDictionary?
    
    //This initializer gets the squad name and then fetches all data
    init(_ squadName: String) {
        self.squadName = squadName
        ref = Database.database().reference().child("squads/" + squadName)//Sets the reference name to that of the squadname
        fetchData()
    }
    
    //This functions fetches and assigns the fetched data to the squad class object
    func fetchData() {
        ref.observe(DataEventType.value, with: { (snapshot) in
            self.squadData = snapshot.value as? NSDictionary
            if let squadData = self.squadData {
                self.admin = squadData["admin"] as? String
                self.password = squadData["password"] as? String
                self.members = squadData["members"] as? NSDictionary
            }
        })
    }
}
