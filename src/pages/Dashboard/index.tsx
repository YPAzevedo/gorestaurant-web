import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      try {
        const res = await api.get('foods');
        setFoods(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const res = await api.post('foods', food);
      setFoods([...foods, res.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const editingFoodAvailability = editingFood.available;
      const res = await api.put(`foods/${editingFood.id}`, {
        ...food,
        available: editingFoodAvailability,
      });
      const foodToUpdateIndex = foods.findIndex(f => f.id === res.data.id);
      if (foodToUpdateIndex < 0) return;
      const newFoods = [...foods];
      newFoods[foodToUpdateIndex] = res.data;
      setFoods(newFoods);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    try {
      await api.delete(`foods/${id}`);
      const newFoods = foods.filter(food => food.id !== id);
      setFoods(newFoods);
    } catch (err) {
      console.log(err);
    }
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    setEditModalOpen(!editModalOpen);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={() => handleDeleteFood(food.id)}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
