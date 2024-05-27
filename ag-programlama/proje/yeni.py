import json

# JSON dosyalarını oku
with open('cn.json', 'r', encoding='utf-8') as file:
    cn_data = json.load(file)

with open('data.json', 'r', encoding='utf-8') as file:
    data_nodes = json.load(file)["nodes"]

# cn.json'dan alınan verileri data.json'a ekleyen fonksiyon
def update_x_y_for_nodes(cn_data, data_nodes):
    # cn_data'dan alınan her bir şehir için döngü
    for index, cn_city in enumerate(cn_data):
        # data_nodes'daki her bir düğüm için döngü
        for node in data_nodes:
            # Eğer düğümün locale'i 'zh_TW' ise ve düğümün index'i cn_data'daki şehir index'ine eşitse
            if node.get("attributes", {}).get("locale") == "zh_TW" and data_nodes.index(node) == index:
                # cn_city'den lat ve lng değerlerini düğüme ekle
                node["x"] = float(cn_city["lng"])
                node["y"] = float(cn_city["lat"])

    return data_nodes

# Fonksiyonu çağır ve sonucu al
updated_nodes = update_x_y_for_nodes(cn_data, data_nodes)

# Sonucu dosyaya yaz
with open('updated_data.json', 'w', encoding='utf-8') as file:
    json.dump({"nodes": updated_nodes}, file, ensure_ascii=False, indent=2)

print("Düğümler güncellendi ve 'updated_data.json' dosyasına kaydedildi.")
