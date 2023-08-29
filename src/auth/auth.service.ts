import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';


import { User } from './entities/user.entity';
import { CreateAuthDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private userModel:Model<User>
  ){}

  async create(createUserDto: CreateAuthDto):Promise<User>{
    
    try {

      const {password, ...userData}=createUserDto;
      const newUser=new this.userModel({
        password:bcrypt.hashSync(password,10),
        ...userData
      });
      await newUser.save();
      const {password:_,...user}=newUser.toJSON();
      return user;

    } catch (error) {
      if(error.code===11000){
        throw new BadRequestException(`${createUserDto.email} already exist`);
      }
      throw new InternalServerErrorException('Something terrible happened');
      console.log(error.code)
    }

  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
