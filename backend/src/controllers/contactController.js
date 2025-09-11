import { body, validationResult } from 'express-validator';
import prisma from '../utils/db.js';

export const addContactValidation = [
  body('contact_email').isEmail().normalizeEmail().withMessage('Valid email required')
];

export const getContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { ownerId: req.user.id },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            lastSeen: true
          }
        }
      },
      orderBy: {
        contact: {
          lastSeen: 'desc'
        }
      }
    });

    res.json({ contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contact_email } = req.body;

    // Check if user is trying to add themselves
    if (contact_email === req.user.email) {
      return res.status(400).json({ error: 'Cannot add yourself as a contact' });
    }

    // Find the contact user
    const contactUser = await prisma.user.findUnique({
      where: { email: contact_email },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        lastSeen: true
      }
    });

    if (!contactUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if contact already exists
    const existingContact = await prisma.contact.findUnique({
      where: {
        ownerId_contactId: {
          ownerId: req.user.id,
          contactId: contactUser.id
        }
      }
    });

    if (existingContact) {
      return res.status(400).json({ error: 'Contact already exists' });
    }

    // Create contact
    const contact = await prisma.contact.create({
      data: {
        ownerId: req.user.id,
        contactId: contactUser.id
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            lastSeen: true
          }
        }
      }
    });

    res.status(201).json({ contact });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contactId = parseInt(id);

    if (isNaN(contactId)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }

    const contact = await prisma.contact.findUnique({
      where: {
        ownerId_contactId: {
          ownerId: req.user.id,
          contactId: contactId
        }
      }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await prisma.contact.delete({
      where: {
        ownerId_contactId: {
          ownerId: req.user.id,
          contactId: contactId
        }
      }
    });

    res.json({ message: 'Contact removed successfully' });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
