import React from 'react';
import { Button, Dimensions, StyleSheet, Image, Text, TouchableOpacity, View } from 'react-native';

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

/**
 * This token only has public repo read access, go ahead and use it ¯\_(ツ)_/¯
 */
const authedFetch = url =>
  fetch(url, {
    headers: { authorization: '74eea4ad83f2a6bee55ea703d6975a4085e8d760' }
  });

export default class App extends React.Component {
  state = {
    doggos: [],
    currentDoggoIndex: -1
  };

  async componentDidMount() {
    /**
     * There may be a more direct way to do this
     *
     * GitHub GraphQL API doesn't seem to expose repo contents
     *
     * https://stackoverflow.com/questions/25022016/get-all-file-names-from-a-github-repo-through-the-github-api
     */
    const latestCommitHash = await this.getLatestCommitHash();
    const treeHash = await this.getTreeHash(latestCommitHash);
    const doggoFiles = await this.getDoggoPicFileNames(treeHash);
    const doggos = await this.generateDoggos(doggoFiles);

    this.setState({ doggos, currentDoggoIndex: 0 });
  }

  getLatestCommitHash = async () => {
    const response = await authedFetch('https://api.github.com/repos/FormidableLabs/dogs/commits');
    const data = await response.json();
    return data[0].sha;
  };

  getTreeHash = async latestCommitHash => {
    const response = await authedFetch(
      `https://api.github.com/repos/FormidableLabs/dogs/git/commits/${latestCommitHash}`
    );
    const data = await response.json();
    return data.tree.sha;
  };

  getDoggoPicFileNames = async treeHash => {
    const response = await authedFetch(
      `https://api.github.com/repos/FormidableLabs/dogs/git/trees/${treeHash}`
    );
    const data = await response.json();
    return data.tree.filter(node => node.path.endsWith('.jpg')).map(node => node.path);
  };

  generateDoggos = async doggoFiles =>
    doggoFiles.map(doggoFile => ({
      name: doggoFile.charAt(0).toUpperCase() + doggoFile.replace('.jpg', '').slice(1),
      img: (
        <Image
          style={{
            width: deviceWidth,
            height: deviceHeight / 2,
            resizeMode: 'contain'
          }}
          source={{
            uri: `https://raw.githubusercontent.com/FormidableLabs/dogs/master/${doggoFile}`,
            cache: 'force-cache'
          }}
        />
      )
    }));

  updateCurrentDoggoIndex = direction => {
    this.setState(prevState => ({
      currentDoggoIndex:
        prevState.currentDoggoIndex === 0 && direction === -1
          ? prevState.doggos.length - 1
          : (prevState.currentDoggoIndex + direction) % prevState.doggos.length
    }));
  };

  nextDoggo = () => {
    this.updateCurrentDoggoIndex(1);
  };

  previousDoggo = () => {
    this.updateCurrentDoggoIndex(-1);
  };

  render() {
    const { doggos, currentDoggoIndex } = this.state;
    if (doggos.length === 0) {
      return (
        <View style={styles.container}>
          <Text>Aww no doggos :(</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            style={{ width: 60, height: 60, resizeMode: 'contain' }}
            source={require('./assets/Formidable-Icon.png')}
          />
          <Text style={{ fontSize: 80 }}>🐶</Text>
        </View>
        <View style={styles.doggo}>
          <Text
            style={{
              fontSize: 40,
              color: 'white'
            }}
          >
            {doggos[currentDoggoIndex].name}
          </Text>
          {doggos[currentDoggoIndex].img}
        </View>
        <View style={styles.controls}>
          <TouchableOpacity onPress={this.previousDoggo}>
            <Text style={{ fontSize: 60 }}>⬅️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Text style={{ fontSize: 80 }}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.nextDoggo}>
            <Text style={{ fontSize: 60 }}>➡️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e2852'
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#f04d21',
    borderBottomWidth: 1
  },
  doggo: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  controls: {
    paddingLeft: 20,
    paddingRight: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopColor: '#f04d21',
    borderTopWidth: 1
  }
});
