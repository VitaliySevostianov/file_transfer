import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  StatusBar,
  Button,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
const RNFS = require('react-native-fs');
import axios from 'axios';

const App = () => {
  const [newFilesAmount, setNewFilesAmount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [filesContent, setFilesContent] = useState([]);
  const [dirPath, setDirPath] = useState('/storage/emulated/0/Hackaton/');
  const refreshFilesInDB = async () => {
    try {
      let newFiles = [];

      let dirResult = await RNFS.readDir(dirPath);

      dirResult.forEach((element, i) => {
        newFiles[i] = {
          name: `file_${i}`,
          filename: element.name,
          filepath: element.path,
        };
      });
      console.log(newFiles);
      setFiles(newFiles);
      setNewFilesAmount(newFiles.length);

      return newFiles;
    } catch (e) {
      console.log(e);
      setFiles([
        {
          filename: 'Такой папки не существует',
        },
        {
          filename: 'Или она пуста',
        },
      ]);
    }
  };

  const updateFilesToUpload = async () => {
    try {
      let result = await RNFS.readDir(dirPath).catch(e =>
        console.log(e, 'READ DIR'),
      );
      let names = [];
      let statResult = [];
      let content = [];
      let onlyFilesNames = [];

      for (let i = 0; i < result.length; i++) {
        statResult[i] = await RNFS.stat(result[i].path).catch(e =>
          console.log(e, 'STAT RESULT'),
        );
        names[i] = result[i].name;
        if (statResult[i].isFile()) {
          content[i] = await RNFS.readFile(statResult[i].path, 'base64').catch(
            e => console.log(e, 'READ FILE'),
          );
          onlyFilesNames[i] = names[i];
        } else {
          content[i] = 'not file';
          onlyFilesNames[i] = 'not file';
        }
      }

      const filteredNames = onlyFilesNames.filter(
        el => el != undefined && el != 'not file',
      );
      const filteredContent = content.filter(
        el => el != undefined && el != 'not file',
      );
      setFileNames(filteredNames);
      setFilesContent(filteredContent);
    } catch (error) {
      console.log(error, 'UPDATE FILES');
    }
  };

  const uploadFiles = async () => {
    try {
      refreshFilesInDB();
      updateFilesToUpload();
      let reqData = [];

      for (let i = 0; i < filesContent.length; i++) {
        reqData[i] = {
          content: filesContent[i],
          filenames: fileNames[i],
        };
      }
      // axios
      //   .get('http://127.0.0.1:3000/')
      //   .then(res => console.log(res.data))
      //   .catch(e => console.log(e));
      axios
        .post(
          'http://127.0.0.1:3000/',
          {reqData: reqData},
          {
            onUploadProgress: progressEvent => {
              try {
                console.log('Uploading');
                setIsUploading(true);
                if (progressEvent.loaded == progressEvent.total) {
                  setTimeout(() => {
                    setIsUploading(false);
                    console.log(isUploading);
                    console.log('Success');
                  }, 2000);
                }
              } catch (error) {
                console.log(error, 'UPLOAD SCREEN');
              }
            },
          },
        )
        // .then(() => console.log('Success'))
        .catch(e => console.log(e, 'POST'));
    } catch (error) {
      console.log(error, 'UPLOAD');
    }
  };

  useEffect(() => {
    refreshFilesInDB();
    updateFilesToUpload();
  }, [dirPath]);

  if (isUploading == false) {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <SafeAreaView>
          <View
            style={{
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            <TextInput
              style={{backgroundColor: '#22334450'}}
              value={dirPath}
              onChangeText={text => {
                setDirPath(text);
                refreshFilesInDB();
              }}
            />
            <Button title="Обновить файлы" onPress={() => refreshFilesInDB()} />
            <Text>Количество папок/файлов: {newFilesAmount}</Text>
            <FlatList
              style={{
                backgroundColor: '#25425240',
                width: 300,
              }}
              data={files}
              renderItem={item => {
                return (
                  <View style={{flexDirection: 'row', padding: 5}}>
                    <Text numberOfLines={3} style={{color: 'black'}}>
                      {item.index + 1} -
                    </Text>
                    <Text numberOfLines={3} style={{color: 'black'}}>
                      {item.item.filename}
                    </Text>
                  </View>
                );
              }}
              keyExtractor={item => item.filename}
            />
            <Button title="Выгрузить файлы" onPress={() => uploadFiles()} />
          </View>
        </SafeAreaView>
      </>
    );
  } else {
    return (
      <View
        style={{
          flex: 1,
          alignSelf: 'center',
        }}>
        <Text
          style={{
            flex: 1,
            fontSize: 50,
            textAlignVertical: 'center',
          }}>
          {/* Uploading */}
          <ActivityIndicator
            style={{height: 50, width: 50}}
            size={50}
            color="#0000ff"
          />
        </Text>
      </View>
    );
  }
};

// const styles = StyleSheet.create({
// });

export default App;
