import Foundation

struct MediaURL {
    let value: URL

    init?(object: Any?) {
        guard let urlString = object as? String, urlString.lowercased().hasPrefix("http"),
              let url = URL(string: urlString) else {
            return nil
        }
        self.value = url
    }
}
