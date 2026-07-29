with open(r'C:\Users\ASUS ROG\.gemini\antigravity\scratch\latest_user_request.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's find where '20\nNicholas Matthew Halim' starts
pos20 = text.find('\n20\nNicholas Matthew Halim')
if pos20 != -1:
    print("=== RAW BLOCK FOR ID 20 to 28 ===")
    print(repr(text[pos20:pos20+1500]))

pos27 = text.find('\n27\nValerie Legolas Cen')
if pos27 != -1:
    print("=== RAW BLOCK FOR ID 27 ===")
    print(repr(text[pos27:pos27+1000]))
