import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { LinkPrecedence } from './contact.controller';

@Injectable()
export class ContactService {
  create(data: CreateContactDto) {
    return 'This action adds a new contact';
  }

  findAll() {
    return `This action returns all contact`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contact`;
  }

  update(id: number, updateContactDto: UpdateContactDto) {
    return `This action updates a #${id} contact`;
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }

  sortResult = (contactA, contactB) => {
    if (contactA.id < contactB.id) {
      return -1;
    }
    if (contactA.id > contactB.id) {
      return 1;
    }
    return 0;
  };

  prepareResponse(contacts) {
    contacts.sort(this.sortResult);
    if (contacts.length > 0) {
      const emails = contacts
        .filter((item) => item.email !== null)
        .map((item) => item.email);
      const phoneNumbers = contacts
        .filter((item) => item.phoneNumber !== null)
        .map((item) => item.phoneNumber);

      const filteredContacts = contacts.filter(
        (item) =>
          item.linkPrecedence === `secondary` && item.linkPrecedence !== null,
      );
      const secondaryContactIds = filteredContacts.map((item) => item.id);
      const response = {
        contact: {
          primaryContactId: contacts[0].id,
          emails: [...new Set(emails)],
          phoneNumbers: [...new Set(phoneNumbers)],
          secondaryContactIds: [...new Set(secondaryContactIds)],
        },
      };
      return response;
    }
    return contacts;
  }
}
