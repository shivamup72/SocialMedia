import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  useWindowDimensions,
  Alert,
  Modal,
  BackHandler,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import {
  DarkColor60,
  mainOrange25,
  fonts,
  DarkColor,
  DarkColor80,
  DarkColor50,
  mainOrangeColor,
  DarkCOlor30,
  mainWhiteColor,
  DarkColor20,
} from '../../../utils/style/fonts';
import FilterComponents from './FilterComponents/FilterComponents';
import AddWorkComponents from './AddWorkNotesComponents/index';
import {
  GetMyFolderApi,
  GetMyNotesApi,
  DeleteMyFolderApi,
  DeleteMyNotesApiId,
} from '../../../Api/config/TimelyApi';
import { formatDate } from '../../../utils/CommonUtils';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import ThreeVerticalDots from '../../../assets/svg/threeDots';
import Toast from '../../../Api/context/Toast';
import LightDeleteSvg from '../../../assets/svg/LightDeleteSvg';
import RenderHTML from 'react-native-render-html';

import FolderSvgIcon from '../../../assets/svg/FolderSvgIcon';

import ConfirmationModal from '../ReuseableComponents/ReuseableComponents';
import Header from '../TimelyheaderComponents/Header';
import HeaderComponents from '../HomeComponents/HeaderhomeComponents/Header';
import AddNotesheader from './AddNotes/AddNotesheader';

const NoteCard = ({ item, onPress, onMenuPress }) => {

  const menuButtonRef = React.useRef(null);

  const handleMenuIconPress = () => {
    if (!menuButtonRef.current) {
      console.warn('Menu button ref is not available');
      return;
    }

    menuButtonRef.current.measureInWindow((x, y, width, height) => {
      if (x == null || y == null || width == null || height == null) {
        console.warn('Could not measure menu button position', {
          x,
          y,
          width,
          height,
        });
        return;
      }

      onMenuPress(item, { x, y, width, height });
    });
  };

  return (
    <Pressable
      // onPress={() => onPress(item)}
      style={({ pressed }) => [styles.noteCard, pressed && styles.pressedCard]}>
      <View style={[styles.noteBorder, { backgroundColor: item?.color }]} />
      {console.log('item color ----->', item)}
      <View style={styles.noteContent}>
        <View style={{ position: 'absolute', right: 10, top: 5 }}>
          <Text allowFontScaling={false} style={styles.noteTime}>
            {formatDate(item?.updated_at)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => onPress(item)}>
          <FolderSvgIcon />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <TouchableOpacity
            style={[styles.titleRow, { marginRight: 10 }]}
            onPress={() => onPress(item)}>
            <View>
              <Text
                allowFontScaling={false}
                style={styles.noteTitle}
                numberOfLines={2}>
                {item?.name}
                <Text allowFontScaling={false} style={styles.count}>
                  {' '}({item?.notes_count || 0})
                </Text>
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ justifyContent: 'center', padding: 8 }}
            ref={menuButtonRef}
            onPress={handleMenuIconPress}>
            <ThreeVerticalDots />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};


const MyNoteScreen = ({ route }) => {
  const flag = route?.params?.flag || null; `1233`
  console.log('route params --=-=-=-=->', flag);
  const AddWorkImage = require('../../../assets/Png/PlusIcon.png');
  const AstroImage = require('../../../assets/Png/AstronotSitting.png');
  const [showMainModal, setShowMainModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [folderList, setFolderList] = useState([]);
  const [FilterValue, setFilterValue] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [EditType, setEditType] = useState('noraml');
  const pageSize = 6;

  const [isMenuVisible, setMenuVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [menuPosition, setMenuPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [folderToEdit, setFolderToEdit] = useState(null);
  const { width: windowWidth } = useWindowDimensions();
  const toastRef = useRef(null);
  const navigation = useNavigation();
  const IsFocused = useIsFocused();
  const navigationState = navigation.getState();
  const previousRouteName = useRef();

  const handleCloseFolderModal = () => {
    setShowFolderModal(false);
    setFolderToEdit(null);
  };

  // Handle navigation state changes
  // Store lastFolderId in a ref
  const lastFolderIdRef = useRef(null);

  useEffect(() => {
    if (!IsFocused) {
      // Only reset selectedNote when navigating away from the screen
      if (
        selectedNote &&
        navigationState.routes[navigationState.index]?.name !== 'MyNoteScreen'
      ) {
        setSelectedNote(null);
      }
    } else {
      // When coming back from AddNotesScreen, if a folder was previously selected, restore it
      if (selectedNote === null && lastFolderIdRef.current) {
        // Find the folder by id
        const folder = folderList.find(f => f.id === lastFolderIdRef.current);
        if (folder) {
          setSelectedNote(folder);
        } else {
          setSelectedNote(false);
        }
        lastFolderIdRef.current = null; // Reset after use
      } else if (selectedNote === null) {
        setSelectedNote(false);
      }
    }
  }, [IsFocused, navigationState, folderList]);

  // Handle Android hardware back button to go back, not close app
  useEffect(() => {
    const onBackPress = () => {
      if (selectedNote) {
        setSelectedNote(null);
        return true;
      } else if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [selectedNote, navigation]);
  // console.log('selectedFolder --===--->', selectedNote);
  const NoteDetailView = ({ note, onBack }) => {
    const stripTrailingEmptyTags = html => {
      if (!html) {
        // console.log('note data -=-=---->', html);
        return '';
      }

      // First extract the H1 content if it exists
      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
      const h1Content = h1Match ? h1Match[1] : '';

      // Remove the H1 tag from the original HTML
      let cleanedHtml = html.replace(/<h1[^>]*>.*?<\/h1>/i, '').trim();

      // Clean up any remaining trailing tags
      const trailingTagsRegex =
        /(<br\s*\/?>|<div>\s*(&nbsp;|<br\s*\/?>)*\s*<\/div>|\s|&nbsp;)*$/i;
      cleanedHtml = cleanedHtml.replace(trailingTagsRegex, '');

      // Return the H1 content if it exists, otherwise return the cleaned HTML
      return h1Content || cleanedHtml;
    };

    const [notesData1, setNotesData1] = useState([]);
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const { width } = useWindowDimensions();

    console.log(notesData1, "notesData1notesData1notesData1");


    const [loading, setLoading] = useState(true);

    const FetchData = async () => {
      try {
        setLoading(true);
        await GetMyNotesApi({ folder_id: note?.id })
          .then(res => {
            // console.log('res on note detail view --===---->', res.results);
            setNotesData1(res?.results);
          })
          .catch(err => {
            console.log('err on note detail view --===---->', err);
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (err) {
        console.log('notes get -=-=------->', err);
      }
    };

    useEffect(() => {
      FetchData();
    }, [note?.id, IsFocused]);

    const promptForDelete = item => {
      setNoteToDelete(item);
      setDeleteModalVisible(true);
    };

    const handleDelete = async () => {
      if (!noteToDelete) return;
      try {
        const res = await DeleteMyNotesApiId(noteToDelete.id, {});
        if (res.success) {
          toastRef.current.show({
            type: 'success',
            message: 'Note deleted successfully.',
          });
          FetchData();
        } else {
          toastRef.current.show({
            type: 'error',
            message: res?.message || 'Failed to delete note.',
          });
        }
      } catch (err) {
        console.log('err deleted api --=-=-=-=>', err);
        toastRef.current.show({
          type: 'error',
          message: 'An error occurred.',
        });
      } finally {
        setDeleteModalVisible(false);
        setNoteToDelete(null);
      }
    };

    const renderNoteItem = ({ item }) => {
      const cleanedHtml = stripTrailingEmptyTags(item?.title || item?.text);
      return (
        <View style={styles.detailNoteItemCard}>
          <TouchableOpacity
            style={{ paddingRight: 5, flex: 1 }}
            onPress={() => {
              lastFolderIdRef.current = note?.id;
              navigation.navigate('AddNotesScreen', {
                id: note?.id,
                Edit: true,
                noteData: item,
                name: note?.name,
                Folderid: selectedNote?.id,
              });
            }}
          >
            <RenderHTML
              contentWidth={width}
              source={{ html: cleanedHtml }}
              baseStyle={{ color: DarkColor80 }}
              tagsStyles={{
                p: { margin: 0, padding: 0 },
                div: { margin: 0, padding: 0 },
              }}
            />
          </TouchableOpacity>

          <View style={{ justifyContent: 'center' }}>
            <TouchableOpacity
              style={{ alignItems: 'center' }}
              onPress={() => promptForDelete(item)}>
              <LightDeleteSvg width="18" height="18" color="red" />
            </TouchableOpacity>
          </View>
        </View>
      );
    };

    return (
      <View style={styles.detailViewContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text
              allowFontScaling={false}
              style={[
                styles.backButtonText,
                { fontSize: 18, fontFamily: fonts.PoppinsSemiBold },
              ]}>
              {'<'}
            </Text>
            <Text
              allowFontScaling={false}
              style={[styles.backButtonText, { marginTop: 4, marginLeft: 5 }]}>
              Back to Folders
            </Text>
          </TouchableOpacity>
          <View style={{ marginLeft: 10, marginRight: 0 }}>
            <Text
              style={[
                styles.backButtonText,
                {
                  fontSize: 12,
                  color: mainOrangeColor,
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {selectedNote?.name?.length > 30
                ? `${selectedNote?.name?.substring(0, 29)}...`
                : selectedNote?.name}
            </Text>
          </View>
        </View>

        {loading ? (
          <View
            style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <ActivityIndicator color={mainOrangeColor} size="small" />
          </View>
        ) : notesData1.length === 0 ? (
          <View style={styles.noNotesContainer}>
            <Image source={AstroImage} style={styles.noNotesImage} />
            <Text allowFontScaling={false} style={styles.noNotesText}>
              No notes found
            </Text>
          </View>
        ) : (
          <FlatList
            data={notesData1}
            renderItem={renderNoteItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}

        <View style={{ position: 'absolute', bottom: 110, right: -10 }}>
          <TouchableOpacity
            onPress={() => {
              lastFolderIdRef.current = note?.id;
              navigation.navigate('AddNotesScreen', {
                id: note?.id,
                Edit: false,
                noteData: null,
              });
            }}
          >
            <Image
              source={AddWorkImage}
              style={{ width: 45, height: 45, resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        </View>

        <ConfirmationModal
          isVisible={isDeleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
          onConfirm={handleDelete}
        />
      </View>
    );
  };

  console.log(selectedNote, "getFoldkknknknerList");


  const fetchData = async (loadMore = false) => {
    if (loading) return false;

    const nextPage = loadMore ? page + 1 : 1;

    if (loadMore && !hasMore) return false;

    try {
      setLoading(true);
      const filter_dateType = FilterValue
        ? FilterValue.toLowerCase().replace(/\s+/g, '_')
        : '';

      if (loadMore) {
        setPage(nextPage);
      }

      const responses = await GetMyFolderApi({
        filter_date_type: filter_dateType,
        page: nextPage,
        page_size: pageSize,
      });

      // console.log('Get My Folder Api =====>', responses);

      if (!loadMore) {
        setFolderList(responses?.results || []);
      } else {
        setFolderList(prev => {
          // Create a map to avoid duplicates
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = (responses?.results || []).filter(
            item => !existingIds.has(item.id),
          );
          return [...prev, ...newItems];
        });
      }

      const receivedItems = responses?.results?.length || 0;
      setHasMore(receivedItems === pageSize);

      return true;
    } catch (err) {
      console.log('error --===----->', err);

      if (loadMore) {
        setPage(prevPage => Math.max(1, prevPage - 1));
      }
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchData(false);
  }, [FilterValue, IsFocused]);

  const onRefresh = async () => {
    setPage(1);
    setHasMore(true);
    setFolderList([]);
    await fetchData(false);
  };

  const loadMoreData = () => {
    if (!loading && hasMore) {
      console.log('Loading more data, current page:', page);
      fetchData(true);
    } else {
      console.log('Not loading more. Loading:', loading, 'Has more:', hasMore);
    }
  };

  const handleMenuOpen = (item, position) => {
    setSelectedFolder(item);
    setMenuPosition(position);
    setMenuVisible(true);
  };

  const handleMenuClose = () => {
    setMenuVisible(false);
    setSelectedFolder(null);
  };

  // console.log('ksns ssn -ssn',folderToEdit);

  const handleEdit = () => {
    if (!selectedFolder) return;
    // console.log(' selected by fodler --=----->', selectedFolder);
    setFolderToEdit(selectedFolder);
    setShowMainModal(true);
    setEditType('edit');
    handleMenuClose();
  };

  const handleDelete = async () => {
    console.log('selected folder data ------->', selectedFolder, '\n', '\n');

    try {
      const respnse = await DeleteMyFolderApi(selectedFolder?.id, {});
      handleMenuClose();
      if (respnse.success) {
        toastRef.current.show({
          type: 'success',
          message: `${selectedFolder.name} folder deleted successfully.`,
        });
        onRefresh();
        // console.log('sssks s  ----->', respnse);
      } else {
        toastRef.current.show({
          type: 'error',
          message: respnse?.message,
        });
      }
    } catch (err) {
      console.log('Delete folder api ----=----->', err);
    }
  };

  const handleCloseMainModal = () => {
    setShowMainModal(false);
  };

  const handleOpenFolder = () => {
    setShowMainModal(false);
    setShowFolderModal(true);
  };

  const renderItemMenu = () => (
    <Modal
      transparent={true}
      visible={isMenuVisible}
      animationType="fade"
      onRequestClose={handleMenuClose}
      statusBarTranslucent={true}>
      <Pressable style={stylesTriangle.modalOverlay} onPress={handleMenuClose}>
        <View
          style={[
            stylesTriangle.menuContainer,
            {
              position: 'absolute',
              top: menuPosition.y + menuPosition.height + 22,
              right: windowWidth - menuPosition.x - menuPosition.width - 8,
            },
          ]}>
          <View style={stylesTriangle.triangle} />
          <Pressable
            onPress={handleEdit}
            style={stylesTriangle.menuItemContainer}>
            <Text allowFontScaling={false} style={stylesTriangle.menuItem}>
              Edit
            </Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={stylesTriangle.menuItemContainer}>
            <Text
              allowFontScaling={false}
              style={[stylesTriangle.menuItem, { color: '#E53935' }]}>
              Delete
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );

  // Handle note selection
  const handleNotePress = note => {
    setSelectedNote(note);
  };

  const handleBackFromDetail = () => {
    setSelectedNote(false);
  };

  return (
    <>
      {flag === "flag" && <AddNotesheader
        navigation={navigation}
        Type={'Folders'}
      />}
      <View style={styles.container}>
        {selectedNote ? (
          <NoteDetailView note={selectedNote} onBack={handleBackFromDetail} />
        ) : (
          <>
            <View style={styles.header}>
              <Text allowFontScaling={false} style={styles.headerTitle}>
                FOLDERS ({folderList.length})
              </Text>
              <FilterComponents
                setFilterValue={setFilterValue}
                selectedFilter={FilterValue}
              />
            </View>

            {folderList.length > 0 ? (
              <FlatList
                data={folderList}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <NoteCard
                    item={item}
                    onPress={() => handleNotePress(item)}
                    onMenuPress={(item1, position) => {
                      handleMenuOpen(item1, position);
                      setSelectedFolder(item1);
                    }}
                    handleDeleteMethod={handleDelete}
                  />
                )}
                contentContainerStyle={styles.noteList}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMoreData}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#FF6B00" />
                    </View>
                  ) : null
                }
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#FF6B00']}
                    tintColor="#FF6B00"
                    title="Refreshing..."
                    titleColor={DarkColor60}
                  />
                }
              />
            ) : (
              <View style={styles.noNotesContainer}>
                <Image source={AstroImage} style={styles.noNotesImage} />
                <Text allowFontScaling={false} style={styles.noNotesText}>
                  No folders yet?
                </Text>
                <Text allowFontScaling={false} style={styles.noNotesText1}>
                  Create one to start organizing your notes!
                </Text>
              </View>
            )}
            <View style={{ position: 'absolute', bottom: flag === "flag" ? 80 : 110, right: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowMainModal(true);
                  setEditType('normal');
                }}
                style={{ backgroundColor: mainWhiteColor }}>
                <Image source={AddWorkImage} style={{ width: 50, height: 50 }} />
              </TouchableOpacity>
            </View>
          </>
        )}

        <AddWorkComponents
          visible={showMainModal}
          showFolderModal={showFolderModal}
          onClose={handleCloseMainModal}
          onOpenFolder={handleOpenFolder}
          onCloseFolder={handleCloseFolderModal}
          setRefreshing={setRefreshing}
          editingData={folderToEdit}
          edit={EditType}
          onCreateFolder={async (name, color) => {
            try {
              setRefreshing(true);
              await fetchData();
            } catch (error) {
              console.log('Error refreshing data:', error);
            } finally {
              setRefreshing(false);
            }
          }}
        />

        <Toast ref={toastRef} />

        {renderItemMenu()}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 10,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    letterSpacing: 0.3,
  },
  noteList: {
    paddingBottom: 60,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    minHeight: 80,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  pressedCard: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  noteBorder: {
    width: 4,
    height: '100%',
  },
  noteContent: {
    flex: 1,
    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    // backgroundColor: 'rgba(0, 0, 0, 0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    width: 46,
    height: 46,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  titleRow: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    marginBottom: 4,
    flex: 1,
    justifyContent: 'center',
  },
  noteTitle: {
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginRight: 8,
  },
  count: {
    color: DarkColor60,
    fontFamily: fonts.PoppinsRegular,
  },
  noteDescription: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    lineHeight: 16,
  },
  noteTime: {
    fontSize: 8,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
  },
  noNotesImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  noNotesText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginTop: 10,
  },

  noNotesText1: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    marginTop: 10,
  },
  noNotesContainer: {
    flex: 1,
    alignItems: 'center',
    top: '15%',
  },
  loadingContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Styles for Note Detail View
  detailViewContainer: {
    flex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    paddingBottom: 10,
  },
  backButtonText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 12,
    color: DarkColor50,
  },
  detailCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 2,
    padding: 16,
    marginBottom: 25,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  detailTitleInput: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 20,
    color: DarkColor,
    padding: 0,
    marginBottom: 4,
  },
  detailCategory: {
    fontFamily: fonts.PoppinsRegular,
    fontSize: 12,
    color: DarkColor60,
  },
  detailContentInput: {
    flex: 1,
    fontFamily: fonts.PoppinsRegular,
    fontSize: 14,
    lineHeight: 18,
    color: DarkColor80,
    padding: 0,
  },

  //  Notes Style

  detailViewContainer: {
    flex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    paddingBottom: 10,
  },
  // backButtonText: {
  //   fontFamily: fonts.PoppinsSemiBold,
  //   fontSize: 12,
  //   color: DarkColor50,
  // },
  detailNoteItemCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    flex: 1,
    // height: 300,
  },
  detailNoteItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailNoteItemTitle: {
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  detailNoteItemTimestamp: {
    fontSize: 10,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
  },
  detailNoteItemCategory: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
    marginBottom: 12,
  },
  detailNoteItemContent: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    lineHeight: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor80,
  },
  deleteButton: {
    backgroundColor: '#E53935',
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: '#fff',
  },
});

const stylesTriangle = StyleSheet.create({
  triangle: {
    position: 'absolute',
    top: -7,
    right: 10,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 10,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  menuItem: {
    fontSize: 12,
    paddingVertical: 5,
    paddingHorizontal: 5,
    color: DarkColor80,
    fontFamily: fonts.PoppinsRegular,
    flex: 1,
  },
  menuItemSelected: {
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsSemiBold,
  },
  closeButton: {
    padding: 5,
    marginLeft: 5,
  },
});

export default MyNoteScreen;
