import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const categories = [
  { id: 'Food', icon: '🍜', color: '#FCE8D5', tint: '#A65319' },
  { id: 'Travel', icon: '🚆', color: '#DDEBFF', tint: '#315E9A' },
  { id: 'Shopping', icon: '🛍️', color: '#F3E2F8', tint: '#865297' },
  { id: 'Bills', icon: '🧾', color: '#DDF2E5', tint: '#34744E' },
] as const;

type ExpenseCategory = (typeof categories)[number]['id'];
type Expense = {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
};

const initialExpenses: Expense[] = [
  { id: '1', title: 'Market groceries', amount: 68.4, category: 'Food', date: 'Today' },
  { id: '2', title: 'Metro card', amount: 24, category: 'Travel', date: 'Today' },
  { id: '3', title: 'Home supplies', amount: 46.8, category: 'Shopping', date: 'Yesterday' },
  { id: '4', title: 'Electricity bill', amount: 86.5, category: 'Bills', date: 'Yesterday' },
  { id: '5', title: 'Coffee & snack', amount: 12.25, category: 'Food', date: 'Nov 3' },
];

const monthlyBudget = 1200;
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function getCategory(categoryId: ExpenseCategory) {
  return categories.find((category) => category.id === categoryId)!;
}

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark
    ? {
        background: '#101713',
        surface: '#1A241E',
        surfaceMuted: '#222E27',
        text: '#F2F6F2',
        secondary: '#A7B5AA',
        border: '#34433A',
        accent: '#B9F28B',
        accentText: '#1A321D',
      }
    : {
        background: '#F6F8F3',
        surface: '#FFFFFF',
        surfaceMuted: '#EEF2EB',
        text: '#1D2A22',
        secondary: '#7A887D',
        border: '#E8EDE6',
        accent: '#B9F28B',
        accentText: '#1A321D',
      };

  const [expenses, setExpenses] = useState(initialExpenses);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [formError, setFormError] = useState('');

  const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0);
  const budgetProgress = Math.min(totalSpent / monthlyBudget, 1);
  const currentDate = new Date();
  const greeting =
    currentDate.getHours() < 12
      ? 'Good morning'
      : currentDate.getHours() < 18
        ? 'Good afternoon'
        : 'Good evening';
  const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' })
    .format(currentDate)
    .toUpperCase();

  function openForm(expense?: Expense) {
    setEditingId(expense?.id ?? null);
    setTitle(expense?.title ?? '');
    setAmount(expense ? String(expense.amount) : '');
    setCategory(expense?.category ?? 'Food');
    setFormError('');
    setFormVisible(true);
  }

  function closeForm() {
    setFormVisible(false);
    setDeletingExpense(null);
    setFormError('');
  }

  function saveExpense() {
    const parsedAmount = Number(amount);
    if (!title.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError('Enter a description and an amount greater than zero.');
      return;
    }

    if (editingId) {
      setExpenses((current) =>
        current.map((expense) =>
          expense.id === editingId
            ? { ...expense, title: title.trim(), amount: parsedAmount, category }
            : expense,
        ),
      );
    } else {
      setExpenses((current) => [
        {
          id: String(Date.now()),
          title: title.trim(),
          amount: parsedAmount,
          category,
          date: 'Today',
        },
        ...current,
      ]);
    }

    closeForm();
  }

  function confirmDelete(expense: Expense) {
    setDeletingExpense(expense);
  }

  function deleteExpense() {
    if (!deletingExpense) {
      return;
    }
    setExpenses((current) => current.filter((item) => item.id !== deletingExpense.id));
    closeForm();
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.eyebrow, { color: colors.secondary }]}>
              YOUR MONEY, IN FOCUS
            </ThemedText>
            <ThemedText style={[styles.heading, { color: colors.text }]}>{greeting}</ThemedText>
          </View>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <ThemedText style={styles.avatarText}>Y</ThemedText>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: '#1F4735' }]}>
          <View style={styles.summaryTop}>
            <ThemedText style={styles.summaryLabel}>Total spent this month</ThemedText>
            <View style={styles.monthBadge}>
              <ThemedText style={styles.monthBadgeText}>{currentMonth}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.totalAmount}>{currency.format(totalSpent)}</ThemedText>
          <View style={styles.budgetMeta}>
            <ThemedText style={styles.budgetLabel}>of {currency.format(monthlyBudget)} budget</ThemedText>
            <ThemedText style={styles.budgetPercent}>
              {Math.round(budgetProgress * 100)}%
            </ThemedText>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${budgetProgress * 100}%` }]} />
          </View>
          <ThemedText style={styles.remainingText}>
            {currency.format(Math.max(monthlyBudget - totalSpent, 0))} left to spend
          </ThemedText>
        </View>

        <View style={styles.sectionHeading}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Spending categories
          </ThemedText>
          <ThemedText style={[styles.sectionNote, { color: colors.secondary }]}>This month</ThemedText>
        </View>
        <View style={styles.categoryGrid}>
          {categories.map((item) => {
            const categoryTotal = expenses
              .filter((expense) => expense.category === item.id)
              .reduce((total, expense) => total + expense.amount, 0);

            return (
              <View
                key={item.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
                  <ThemedText style={styles.categoryEmoji}>{item.icon}</ThemedText>
                </View>
                <ThemedText style={[styles.categoryName, { color: colors.secondary }]}>
                  {item.id}
                </ThemedText>
                <ThemedText style={[styles.categoryAmount, { color: colors.text }]}>
                  {currency.format(categoryTotal)}
                </ThemedText>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionHeading}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Recent expenses
          </ThemedText>
          <ThemedText style={[styles.sectionNote, { color: colors.secondary }]}>
            {expenses.length} records
          </ThemedText>
        </View>
        <View style={[styles.expenseList, { backgroundColor: colors.surface }]}>
          {expenses.length === 0 ? (
            <ThemedText style={[styles.emptyState, { color: colors.secondary }]}>
              No expenses yet. Add one to get started.
            </ThemedText>
          ) : (
            expenses.slice(0, 6).map((expense, index) => {
              const item = getCategory(expense.category);

              return (
                <View
                  key={expense.id}
                  style={[
                    styles.expenseRow,
                    index < Math.min(expenses.length, 6) - 1 && {
                      borderBottomColor: colors.border,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                  ]}>
                  <View style={[styles.expenseIcon, { backgroundColor: item.color }]}>
                    <ThemedText style={styles.categoryEmoji}>{item.icon}</ThemedText>
                  </View>
                  <View style={styles.expenseDetails}>
                    <ThemedText numberOfLines={1} style={[styles.expenseTitle, { color: colors.text }]}>
                      {expense.title}
                    </ThemedText>
                    <ThemedText style={[styles.expenseMeta, { color: colors.secondary }]}>
                      {expense.category} · {expense.date}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.expenseAmount, { color: colors.text }]}>
                    −{currency.format(expense.amount)}
                  </ThemedText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${expense.title}`}
                    onPress={() => openForm(expense)}
                    hitSlop={8}
                    style={styles.rowAction}>
                    <ThemedText style={[styles.editLabel, { color: colors.secondary }]}>Edit</ThemedText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${expense.title}`}
                    onPress={() => confirmDelete(expense)}
                    hitSlop={8}
                    style={styles.deleteAction}>
                    <ThemedText style={styles.deleteLabel}>×</ThemedText>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => openForm()}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.accent },
            pressed && styles.pressed,
          ]}>
          <ThemedText style={styles.addButtonPlus}>+</ThemedText>
          <ThemedText style={[styles.addButtonText, { color: colors.accentText }]}>
            Add an expense
          </ThemedText>
        </Pressable>
        <ThemedText style={[styles.footerNote, { color: colors.secondary }]}>
          A little awareness goes a long way.
        </ThemedText>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={formVisible || deletingExpense !== null}
        onRequestClose={closeForm}>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close expense form"
            onPress={closeForm}
            style={styles.modalBackdrop}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            {deletingExpense ? (
              <>
                <ThemedText style={[styles.sheetTitle, { color: colors.text }]}>
                  Delete this expense?
                </ThemedText>
                <ThemedText style={[styles.deletePrompt, { color: colors.secondary }]}>
                  Remove “{deletingExpense.title}” ({currency.format(deletingExpense.amount)}) from
                  your history?
                </ThemedText>
                <View style={styles.deleteButtons}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={closeForm}
                    style={[styles.cancelButton, { backgroundColor: colors.surfaceMuted }]}>
                    <ThemedText style={[styles.cancelButtonText, { color: colors.text }]}>
                      Keep expense
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={deleteExpense}
                    style={styles.confirmDeleteButton}>
                    <ThemedText style={styles.confirmDeleteText}>Delete</ThemedText>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.sheetHeading}>
                  <ThemedText style={[styles.sheetTitle, { color: colors.text }]}>
                    {editingId ? 'Edit expense' : 'New expense'}
                  </ThemedText>
                  <Pressable accessibilityRole="button" onPress={closeForm} hitSlop={10}>
                    <ThemedText style={[styles.closeLabel, { color: colors.secondary }]}>
                      Close
                    </ThemedText>
                  </Pressable>
                </View>

                <ThemedText style={[styles.inputLabel, { color: colors.secondary }]}>
                  DESCRIPTION
                </ThemedText>
                <TextInput
                  accessibilityLabel="Expense description"
                  autoCapitalize="sentences"
                  onChangeText={setTitle}
                  placeholder="What did you spend on?"
                  placeholderTextColor={colors.secondary}
                  returnKeyType="next"
                  style={[
                    styles.textInput,
                    { backgroundColor: colors.surfaceMuted, color: colors.text },
                  ]}
                  value={title}
                />

                <ThemedText style={[styles.inputLabel, { color: colors.secondary }]}>AMOUNT</ThemedText>
                <View style={[styles.amountInputWrap, { backgroundColor: colors.surfaceMuted }]}>
                  <ThemedText style={[styles.currencyPrefix, { color: colors.secondary }]}>
                    $
                  </ThemedText>
                  <TextInput
                    accessibilityLabel="Expense amount"
                    keyboardType="decimal-pad"
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor={colors.secondary}
                    style={[styles.amountInput, { color: colors.text }]}
                    value={amount}
                  />
                </View>

                <ThemedText style={[styles.inputLabel, { color: colors.secondary }]}>
                  CATEGORY
                </ThemedText>
                <View style={styles.categoryChoices}>
                  {categories.map((item) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: category === item.id }}
                      onPress={() => setCategory(item.id)}
                      style={[
                        styles.categoryChoice,
                        {
                          backgroundColor: category === item.id ? item.color : colors.surfaceMuted,
                          borderColor: category === item.id ? item.tint : 'transparent',
                        },
                      ]}>
                      <ThemedText style={styles.choiceEmoji}>{item.icon}</ThemedText>
                      <ThemedText
                        style={[
                          styles.choiceLabel,
                          { color: category === item.id ? item.tint : colors.secondary },
                        ]}>
                        {item.id}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>

                {formError ? (
                  <ThemedText accessibilityRole="alert" style={styles.formError}>
                    {formError}
                  </ThemedText>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={saveExpense}
                  style={({ pressed }) => [
                    styles.saveButton,
                    { backgroundColor: colors.accent },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText style={[styles.saveButtonText, { color: colors.accentText }]}>
                    {editingId ? 'Save changes' : 'Save expense'}
                  </ThemedText>
                </Pressable>
              </>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  heading: {
    fontSize: 27,
    fontWeight: '700',
    lineHeight: 34,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#1A321D',
    fontSize: 17,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 27,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#D2E5D6',
    fontSize: 13,
    fontWeight: '500',
  },
  monthBadge: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF1A',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  monthBadgeText: {
    color: '#E6F3E8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1,
    marginTop: 14,
    marginBottom: 20,
  },
  budgetMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  budgetLabel: {
    color: '#D2E5D6',
    fontSize: 12,
  },
  budgetPercent: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF2B',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#B9F28B',
    borderRadius: 8,
  },
  remainingText: {
    color: '#E5F0E7',
    fontSize: 12,
    marginTop: 10,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionNote: {
    fontSize: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 27,
  },
  categoryCard: {
    width: '48%',
    flexGrow: 1,
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  categoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },
  categoryEmoji: {
    fontSize: 17,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 3,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  expenseList: {
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  expenseRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  expenseIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  expenseDetails: {
    flex: 1,
    minWidth: 70,
  },
  expenseTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
  },
  expenseMeta: {
    fontSize: 10,
  },
  expenseAmount: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  rowAction: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginLeft: 3,
  },
  editLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  deleteAction: {
    width: 24,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteLabel: {
    color: '#B34D4D',
    fontSize: 21,
    lineHeight: 25,
    fontWeight: '400',
  },
  emptyState: {
    fontSize: 13,
    paddingVertical: 22,
    textAlign: 'center',
  },
  addButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  addButtonPlus: {
    color: '#1A321D',
    fontSize: 24,
    lineHeight: 25,
    fontWeight: '400',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 14,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000066',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 19,
  },
  sheetTitle: {
    fontSize: 21,
    fontWeight: '700',
  },
  closeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  deletePrompt: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 22,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B34D4D',
  },
  confirmDeleteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 7,
  },
  textInput: {
    minHeight: 48,
    borderRadius: 13,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 15,
  },
  amountInputWrap: {
    minHeight: 48,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  currencyPrefix: {
    fontSize: 16,
    marginRight: 7,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  categoryChoices: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 17,
  },
  categoryChoice: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 13,
    minHeight: 60,
    gap: 3,
  },
  choiceEmoji: {
    fontSize: 16,
  },
  choiceLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  formError: {
    color: '#B34D4D',
    fontSize: 12,
    marginBottom: 10,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
