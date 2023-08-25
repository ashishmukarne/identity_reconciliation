import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5435,
    //   password: 'mFO0nKxkzstt',
    //   username: 'user',
    //   entities: [],
    //   database: 'identity_reconciliation',
    //   synchronize: true,
    //   logging: true,
    // }),
  ContactModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
