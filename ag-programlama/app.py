import pandas as pd
from flask import Flask, render_template, request

app = Flask(__name__)

# Load dataset once at startup for efficiency
df = pd.read_csv('static/lib/data/MyFBFriendsDataSet.csv')

# Ana sayfa ("/") için GET ve POST isteklerini kabul et
@app.route('/', methods=['GET', 'POST'])
def index():
    common_friends = []
    if request.method == 'POST':
        # Formdan gelen verileri al
        friend1_id = request.form['friend1']
        friend2_id = request.form['friend2']

        # Yeni kullanıcının arkadaşlarının ID'lerini set olarak alın
        new_user_friends = set([friend1_id, friend2_id])

        # Yeni kullanıcının arkadaşlarının ortak arkadaşlarını bulma
        common_friends = set()

        for friend_id in new_user_friends:
            # Arkadaşın arkadaş listesini alın
            friend_list_str = str(df.loc[int(friend_id) - 1, 'friendList'])

            # NaN (Not a Number) olmayan ve string olan arkadaş listesi işlenir
            if friend_list_str != 'nan':
                friend_list = set(friend_list_str.split('/'))

                # İlk arkadaş için, ortak arkadaşları bu arkadaşların listesi olarak ayarlayın
                if len(common_friends) == 0:
                    common_friends = friend_list
                else:
                    # Diğer arkadaşlar için, ortak arkadaşları güncelleyin (kesişim al)
                    common_friends = common_friends.intersection(friend_list)

        common_friends = list(common_friends)  # Convert to list for easier handling in template

    return render_template('index.html', common_friends=common_friends)

@app.route('/graph')
def graph():
    return render_template('index.html')

@app.route('/previous')
def previous():
    return render_template('graph.html')

if __name__ == '__main__':
    app.run(debug=True)
