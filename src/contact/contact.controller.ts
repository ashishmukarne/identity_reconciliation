import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { UpdateContactDto } from './dto/update-contact.dto';
import prisma from 'src/prismaClient';
import { contactCTEQuery } from './queries';

export enum LinkPrecedence {
  primary = 'primary',
  secondary = 'secondary',
}

@Controller('identify')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(200)
  async create(@Body() createContactDto) {
    let emailMatched = null;
    let phoneNumberMatched = null;

    const contacts: any = await contactCTEQuery(
      createContactDto.phoneNumber,
      createContactDto.email,
    );
    contacts.forEach((item) => {
      if (
        emailMatched == null &&
        createContactDto.email !== null &&
        item.email === createContactDto.email
      ) {
        emailMatched = item;
      }

      if (
        phoneNumberMatched == null &&
        createContactDto.phoneNumber != null &&
        item.phoneNumber === createContactDto.phoneNumber
      ) {
        phoneNumberMatched = item;
      }
    });

    // trying to insert same record
    if (phoneNumberMatched != null && emailMatched == phoneNumberMatched) {
      return this.contactService.prepareResponse(contacts);
    }

    // update secondary record
    else if (
      emailMatched != null &&
      phoneNumberMatched != null &&
      emailMatched.id != phoneNumberMatched.id
    ) {
      createContactDto.linkPrecedence = LinkPrecedence.secondary;

      createContactDto.linkedId =
        phoneNumberMatched.id > emailMatched.id
          ? emailMatched.id
          : phoneNumberMatched.id;
      const updateRecordId =
        phoneNumberMatched.id > emailMatched.id
          ? phoneNumberMatched.id
          : emailMatched.id;

      createContactDto.linkPrecedence = LinkPrecedence.secondary;
      const updated = await prisma.contact.update({
        data: createContactDto,
        where: { id: updateRecordId },
      });
      contacts.push(updated);

      return this.contactService.prepareResponse(contacts);
    }

    // insert primary
    else if (emailMatched == null && phoneNumberMatched == null) {
      createContactDto.linkedId = null;
      createContactDto.linkPrecedence = LinkPrecedence.primary;
      const created = await prisma.contact.create({ data: createContactDto });
      contacts.push(created);
      return this.contactService.prepareResponse(contacts);
    }

    // insert secondary record
    else if (
      (emailMatched == null && phoneNumberMatched != null) ||
      (emailMatched != null && phoneNumberMatched == null)
    ) {
      createContactDto.linkedId =
        phoneNumberMatched != null ? phoneNumberMatched.id : emailMatched.id;
      createContactDto.linkPrecedence = LinkPrecedence.secondary;
      const created = await prisma.contact.create({ data: createContactDto });
      contacts.push(created);
      return this.contactService.prepareResponse(contacts);
    }

    return contacts;
  }
}
