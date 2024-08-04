'use client'
import Image from "next/image"
import { useState, useEffect } from "react"
import { firestore } from "@/firebase"
import { Box, Modal, Typography, Stack, TextField, Button } from "@mui/material"
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from "firebase/firestore"

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [itemNameError, setItemNameError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateInventory = async () => {
    setIsLoading(true);
    try {
      const snapshot = query(collection(firestore, "inventory"));
      const docs = await getDocs(snapshot);
      const inventoryList = docs.docs.map((doc) => ({
        name: doc.id,
        ...doc.data(),
      }));
      setInventory(inventoryList);
    } catch (error) {
      console.error("Error updating inventory:", error);
      // Consider adding a state variable to display errors to the user
      // setError("Failed to update inventory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  const addItem = async (item) => { 
    setIsLoading(true);
    try {
      const docRef = doc(collection(firestore, "inventory"), item)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const {quantity} = docSnap.data()

        await setDoc(docRef, {quantity: quantity + 1}) 
      } else {
        await setDoc(docRef, {quantity: 1}) 
      }

      await updateInventory() 
    } catch (error) {
      console.error("Error adding item:", error);
      // setError("Failed to add item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  } 

  const removeItem = async (item) => { 
    setIsLoading(true);
    try {
      const docRef = doc(collection(firestore, "inventory"), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const {quantity} = docSnap.data()
        if (quantity === 1) {
          await deleteDoc(docRef)
        } else {
          await setDoc(docRef, {quantity: quantity - 1}) 
        } 
      }

      await updateInventory() 
    } catch (error) {
      console.error("Error removing item:", error);
      // setError("Failed to remove item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  } 

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setIsModalOpen(true)
  const handleClose = () => setIsModalOpen(false)

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, index) => {
    try {
      setDraggedItem(inventory[index]);
      e.dataTransfer.effectAllowed = "move";
    } catch (error) {
      console.error("Error starting drag:", error);
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    try {
      const draggedOverItem = inventory[index];

      if (draggedItem === draggedOverItem) {
        return;
      }

      const newInventory = inventory.filter(item => item !== draggedItem);
      newInventory.splice(index, 0, draggedItem);

      setInventory(newInventory);
    } catch (error) {
      console.error("Error during drag over:", error);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleAddItem = () => {
    if (!itemName.trim()) {
      setItemNameError('Item name cannot be empty');
      return;
    }
    addItem(itemName);
    setItemName('');
    handleClose();
  }

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      bgcolor="green"
      flexDirection="column"
      alignItems="center" 
      justifyContent="flex-start"
      gap={2}
      padding={2}
    >
      <style jsx global>{globalStyles}</style>
      <Modal open={isModalOpen} onClose={handleClose}>
        <Box
        position = "absolute"
        top = "50%"
        left = "50%"
        width = {400}
        bgcolor = "white"
        border = "2px solid #000"
        boxShadow = {24}
        p = {4}
        display = "flex"
        flexDirection = "column"
        gap = {3}
        sx = {{transform: "translate(-50%, -50%)"}}
        >
          <Typography variant = "h6">Add Item</Typography>
          <Stack width = "100%" direction = "row" spacing = {2}>
            <TextField
            variant = "outlined"
            fullWidth
            label = "Item Name"
            value = {itemName}
            onChange = {(e) => setItemName(e.target.value)}
            error={!!itemNameError}
            helperText={itemNameError}
            />
            <Button
            variant = "outlined" onClick ={handleAddItem}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      
      <Box width="100%" maxWidth="1200px">
        <Typography variant="h2" color="#333" textAlign="center" marginBottom={4}>
          Inventory Items
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
          <TextField
            variant="outlined"
            label="Search Items"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, marginRight: 2 }}
            className="search-field"
          />
          <Button variant="contained" onClick={handleOpen}>
            Add New Item
          </Button>
        </Box>
        
        <Stack width="100%" spacing={2} overflow="auto" maxHeight="calc(100vh - 200px)">
          {filteredInventory.map(({name, quantity}, index) => (
            <Box
              key={name} 
              width="100%"
              minHeight="100px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="white"
              padding={3}
              borderRadius="4px"
              border="2px solid #333"
              boxShadow="0 2px 4px rgba(0,0,0,0.1)"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <Box display="flex" flex={1}>
                <Typography variant='h4' color="#333" textAlign="left" flex={1} className="inventory-item-name">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant='h4' color="#333" textAlign="center" flex={1} className="inventory-item-quantity">
                  {quantity}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} flex={1} justifyContent="flex-end">
                <Button 
                  variant="contained" 
                  sx={{ backgroundColor: 'green', '&:hover': { backgroundColor: 'darkgreen' } }}
                  onClick={() => addItem(name)}
                >
                  Add
                </Button>
                <Button 
                  variant="contained" 
                  sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }}
                  onClick={() => removeItem(name)}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '4px',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#333'
          }}
        >
          {currentTime.toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  )
}

// Add this at the end of the file, outside the component function
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

  .MuiTypography-root, .MuiButton-root, .MuiTextField-root {
    font-family: 'Roboto', sans-serif !important;
  }

  .inventory-item-name {
    font-size: 1.5rem !important;
    font-weight: 700 !important;
  }

  .inventory-item-quantity {
    font-size: 1.5rem !important;
    font-weight: 400 !important;
  }

  .search-field .MuiInputBase-input {
    font-size: 1.2rem !important;
  }
`;