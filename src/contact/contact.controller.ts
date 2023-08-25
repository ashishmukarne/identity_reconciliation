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
    let emailMatchedId = 0;
    let phoneNumberMatchedId = 0;

    const contacts: any = await contactCTEQuery(
      createContactDto.phoneNumber,
      createContactDto.email,
    );
    contacts.forEach((item) => {
      if (
        emailMatchedId == 0 &&
        createContactDto.email !== null &&
        item.email === createContactDto.email
      ) {
        emailMatchedId = item.id;
      }

      if (
        phoneNumberMatchedId == 0 &&
        createContactDto.phoneNumber != null &&
        item.phoneNumber === createContactDto.phoneNumber
      ) {
        phoneNumberMatchedId = item.id;
      }
    });

    // trying to insert same record
    if (phoneNumberMatchedId != 0 && emailMatchedId == phoneNumberMatchedId) {
      return this.contactService.prepareResponse(contacts);
    }

    // update secondary record
    else if (
      emailMatchedId != 0 &&
      phoneNumberMatchedId != 0 &&
      emailMatchedId != phoneNumberMatchedId
    ) {
      createContactDto.linkedId = phoneNumberMatchedId;
      createContactDto.linkPrecedence = LinkPrecedence.secondary;

      createContactDto.linkedId =
        phoneNumberMatchedId > emailMatchedId
          ? emailMatchedId
          : phoneNumberMatchedId;

      createContactDto.linkPrecedence = LinkPrecedence.secondary;
      const updated = await prisma.contact.update({
        data: createContactDto,
        where: { id: phoneNumberMatchedId },
      });
      contacts.push(updated);

      return this.contactService.prepareResponse(contacts);
    }

    // insert primary
    else if (emailMatchedId == 0 && phoneNumberMatchedId == 0) {
      createContactDto.linkedId = null;
      createContactDto.linkPrecedence = LinkPrecedence.primary;
      const created = await prisma.contact.create({ data: createContactDto });
      contacts.push(created);
      return this.contactService.prepareResponse(contacts);
    }

    // insert secondary record
    else if (
      (emailMatchedId == 0 && phoneNumberMatchedId != 0) ||
      (emailMatchedId != 0 && phoneNumberMatchedId == 0)
    ) {
      createContactDto.linkedId =
        phoneNumberMatchedId != 0 ? phoneNumberMatchedId : emailMatchedId;
      createContactDto.linkPrecedence = LinkPrecedence.secondary;
      const created = await prisma.contact.create({ data: createContactDto });
      contacts.push(created);
      return this.contactService.prepareResponse(contacts);
    }

    return contacts;
  }

  @Get()
  findAll() {
    return this.contactService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactService.update(+id, updateContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactService.remove(+id);
  }
}
