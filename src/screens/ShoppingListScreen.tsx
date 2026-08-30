import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppContext } from '../AppContext';
import { useTheme } from '../theme/ThemeContext';

export default function ShoppingListScreen() {
  const { shoppingList, addShoppingItem, toggleShoppingItem, removeShoppingItem, clearShoppingList } = useAppContext();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1 item');
  const { theme } = useTheme();

  const handleAdd = () => {
    addShoppingItem(name, quantity);
    setName('');
    setQuantity('1 item');
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.text }]}>Shopping List</Text>

      <View style={styles.inputRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Add ingredient"
          style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholderTextColor={theme.colors.textMuted}
        />
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Qty"
          style={[styles.input, styles.qtyInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      <Pressable style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]} onPress={handleAdd}>
        <Text style={styles.primaryText}>Add item</Text>
      </Pressable>

      {shoppingList.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No shopping items yet.</Text>
      ) : (
        <>
          <FlatList
            data={shoppingList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={[styles.itemRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Pressable onPress={() => toggleShoppingItem(item.id)} style={[styles.checkboxWrap, { borderColor: theme.colors.primary }]}>
                  <Text style={[styles.checkbox, { color: theme.colors.primary }]}>{item.checked ? '✓' : ''}</Text>
                </Pressable>
                <View style={styles.itemLabelWrap}>
                  <Text style={[styles.itemName, { color: theme.colors.text }, item.checked && styles.checkedText]}>{item.name}</Text>
                  <Text style={[styles.itemQuantity, { color: theme.colors.textMuted }]}>{item.quantity}</Text>
                </View>
                <Pressable onPress={() => removeShoppingItem(item.id)} style={styles.deleteButton}>
                  <Text style={[styles.deleteText, { color: theme.colors.danger }]}>Remove</Text>
                </Pressable>
              </View>
            )}
          />

          <Pressable style={[styles.secondaryButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} onPress={clearShoppingList}>
            <Text style={[styles.secondaryText, { color: theme.colors.text }]}>Clear list</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
  },
  qtyInput: {
    flex: 0.5,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
  },
  secondaryText: {
    fontWeight: '700',
  },
  list: {
    paddingVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  checkboxWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkbox: {
    fontSize: 16,
  },
  itemLabelWrap: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemQuantity: {
    marginTop: 2,
    fontSize: 12,
  },
  checkedText: {
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    marginLeft: 8,
  },
  deleteText: {
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
  },
});
