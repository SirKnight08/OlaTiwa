import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppContext } from '../AppContext';
import { theme } from '../theme';

export default function ShoppingListScreen() {
  const { shoppingList, addShoppingItem, toggleShoppingItem, removeShoppingItem, clearShoppingList } = useAppContext();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1 item');

  const handleAdd = () => {
    addShoppingItem(name, quantity);
    setName('');
    setQuantity('1 item');
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Shopping List</Text>

      <View style={styles.inputRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Add ingredient"
          style={styles.input}
          placeholderTextColor={theme.colors.textMuted}
        />
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Qty"
          style={[styles.input, styles.qtyInput]}
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      <Pressable style={styles.primaryButton} onPress={handleAdd}>
        <Text style={styles.primaryText}>Add item</Text>
      </Pressable>

      {shoppingList.length === 0 ? (
        <Text style={styles.emptyText}>No shopping items yet.</Text>
      ) : (
        <>
          <FlatList
            data={shoppingList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Pressable onPress={() => toggleShoppingItem(item.id)} style={styles.checkboxWrap}>
                  <Text style={styles.checkbox}>{item.checked ? '✓' : ''}</Text>
                </Pressable>
                <View style={styles.itemLabelWrap}>
                  <Text style={[styles.itemName, item.checked && styles.checkedText]}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>{item.quantity}</Text>
                </View>
                <Pressable onPress={() => removeShoppingItem(item.id)} style={styles.deleteButton}>
                  <Text style={styles.deleteText}>Remove</Text>
                </Pressable>
              </View>
            )}
          />

          <Pressable style={styles.secondaryButton} onPress={clearShoppingList}>
            <Text style={styles.secondaryText}>Clear list</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  },
  qtyInput: {
    flex: 0.5,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  secondaryText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  list: {
    paddingVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkboxWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkbox: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  itemLabelWrap: {
    flex: 1,
  },
  itemName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  itemQuantity: {
    color: theme.colors.textMuted,
    marginTop: 2,
    fontSize: 12,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  deleteButton: {
    marginLeft: 8,
  },
  deleteText: {
    color: theme.colors.danger,
    fontWeight: '600',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
  },
});
