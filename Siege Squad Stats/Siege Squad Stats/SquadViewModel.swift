//
//  SquadViewModel.swift
//  Siege Squad Stats
//
//  Created by Jonah Hlastala on 2/12/21.
//

import Firebase
import Foundation

class Squad: ObservableObject {
    private var ref = Database.database().reference()
    @Published var val: String?
    
    func fetchData() {
        ref.child("test").setValue(String(Int.random(in: 0...10)))
        ref.child("test").observe(DataEventType.value, with: { (snapshot) in
            self.val = snapshot.value as? String
            print(self.val!)
            return
        })
    }
}
