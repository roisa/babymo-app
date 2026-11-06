import Foundation

/// A lightweight, offline Hijaiyah-recognition question. Small enough for the
/// Apple Watch (no web assets). Shared so iPhone can reuse it too.
public struct HijaiyahQuestion: Sendable, Equatable {
    public let letter: String      // Arabic glyph
    public let answer: String      // correct transliteration
    public let options: [String]   // shuffled choices including the answer
}

public enum HijaiyahQuiz {
    /// The 28 Hijaiyah letters with common transliterations.
    public static let letters: [(glyph: String, name: String)] = [
        ("ا", "Alif"), ("ب", "Ba"), ("ت", "Ta"), ("ث", "Tsa"),
        ("ج", "Jim"), ("ح", "Ha"), ("خ", "Kha"), ("د", "Dal"),
        ("ذ", "Dzal"), ("ر", "Ra"), ("ز", "Zai"), ("س", "Sin"),
        ("ش", "Syin"), ("ص", "Shad"), ("ض", "Dhad"), ("ط", "Tha"),
        ("ظ", "Zha"), ("ع", "'Ain"), ("غ", "Ghain"), ("ف", "Fa"),
        ("ق", "Qaf"), ("ك", "Kaf"), ("ل", "Lam"), ("م", "Mim"),
        ("ن", "Nun"), ("و", "Waw"), ("ه", "Ha'"), ("ي", "Ya")
    ]

    /// Build a question for a given letter index with `choices` options.
    /// Deterministic given the provided index inputs (testable).
    public static func question(at index: Int, distractorSeeds: [Int], choices: Int = 3) -> HijaiyahQuestion {
        let i = ((index % letters.count) + letters.count) % letters.count
        let correct = letters[i]

        var optionIndices: [Int] = [i]
        for seed in distractorSeeds where optionIndices.count < choices {
            let d = ((seed % letters.count) + letters.count) % letters.count
            if !optionIndices.contains(d) { optionIndices.append(d) }
        }
        // Fill if seeds didn't yield enough unique distractors.
        var fill = 0
        while optionIndices.count < choices {
            let d = (i + 1 + fill) % letters.count
            if !optionIndices.contains(d) { optionIndices.append(d) }
            fill += 1
        }

        let options = optionIndices.map { letters[$0].name }
        return HijaiyahQuestion(letter: correct.glyph, answer: correct.name, options: options.shuffled())
    }

    /// Convenience random question for runtime UI.
    public static func random(choices: Int = 3) -> HijaiyahQuestion {
        let i = Int.random(in: 0..<letters.count)
        let seeds = (0..<6).map { _ in Int.random(in: 0..<letters.count) }
        return question(at: i, distractorSeeds: seeds, choices: choices)
    }
}
